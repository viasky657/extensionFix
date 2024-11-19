import MiniSearch, { SearchResult } from 'minisearch';
import { v4 } from 'uuid';
import { create } from 'zustand';
import { ContextProviderDescription, ContextSubmenuItem } from '../../context/providers/types';

const MINISEARCH_OPTIONS = {
    prefix: true,
    fuzzy: 2,
};

const MAX_LENGTH = 70;

interface SubmenuContextState {
    contextProviderDescriptions: ContextProviderDescription[];
    initializeContextProviders: () => Promise<void>;

    minisearches: { [id: string]: MiniSearch };
    fallbackResults: { [id: string]: ContextSubmenuItem[] };
    loaded: boolean;
    initialLoadComplete: boolean;
    isLoading: boolean;

    getSubmenuContextItems: (
        providerTitle: string | undefined,
        query: string,
        limit?: number
    ) => (ContextSubmenuItem & { providerTitle: string })[];
    initializeSubmenuItems: () => Promise<void>;
}

export const useSubmenuContext = create<SubmenuContextState>()((set, get) => ({
    contextProviderDescriptions: [],
    initializeContextProviders: async () => {
        const id = v4();
        vscode.postMessage({ type: 'context/fetchProviders', id });

        const response = await new Promise<ContextProviderDescription[]>((resolve) => {
            const handler = (event: MessageEvent) => {
                const message = event.data;
                if (message.id === id) {
                    window.removeEventListener('message', handler);
                    resolve(message.providers);
                }
            };
            window.addEventListener('message', handler);
        });

        set({ contextProviderDescriptions: response });
    },

    minisearches: {},
    fallbackResults: {},
    loaded: false,
    initialLoadComplete: false,
    isLoading: false,

    getSubmenuContextItems: (providerTitle, query, limit = MAX_LENGTH) => {
        const state = get();
        try {
            const results = getSubmenuSearchResults(state.minisearches, providerTitle, query);
            if (results.length === 0) {
                const fallbackItems = (providerTitle ? state.fallbackResults[providerTitle] ?? [] : [])
                    .slice(0, limit)
                    .map((result) => ({
                        ...result,
                        providerTitle,
                    }));

                if (fallbackItems.length === 0 && !state.initialLoadComplete) {
                    return [
                        {
                            id: 'loading',
                            title: 'Loading...',
                            description: 'Please wait while items are being loaded',
                            providerTitle: providerTitle || 'unknown',
                        },
                    ];
                }

                return fallbackItems;
            }

            return results.slice(0, limit).map((result) => ({
                id: result.id,
                title: result.title,
                description: result.description,
                providerTitle: result.providerTitle,
            }));
        } catch (error) {
            console.error('Error in getSubmenuContextItems:', error);
            return [];
        }
    },

    initializeSubmenuItems: async () => {
        const state = get();

        if (state.contextProviderDescriptions.length === 0 || state.loaded || state.isLoading) {
            return;
        }

        set({ loaded: true, isLoading: true });

        try {
            const disableIndexing = false;

            await Promise.all(
                state.contextProviderDescriptions.map(async (description) => {
                    const shouldSkipProvider = description.dependsOnIndexing && disableIndexing;

                    if (shouldSkipProvider) {
                        console.debug(`Skipping ${description.title} provider due to disabled indexing`);
                        return;
                    }

                    try {
                        const minisearch = new MiniSearch<ContextSubmenuItem>({
                            fields: ['title', 'description'],
                            storeFields: ['id', 'title', 'description'],
                        });

                        // Create a promise that will resolve when we get a response
                        const messageId = v4();
                        const responsePromise = new Promise<any>((resolve) => {
                            const handler = (event: MessageEvent) => {
                                const response = event.data;
                                if (
                                    response.type === 'context/loadSubmenuItems/response'
                                    && response.id === messageId
                                ) {
                                    window.removeEventListener('message', handler);
                                    resolve(response.items);
                                }
                            };
                            window.addEventListener('message', handler);

                            // Send message to extension
                            vscode.postMessage({
                                type: 'context/loadSubmenuItems',
                                title: description.title,
                                id: messageId
                            });
                        });

                        const items: ContextSubmenuItem[] = await responsePromise;
                        minisearch.addAll(items);

                        set((state) => ({
                            minisearches: { ...state.minisearches, [description.title]: minisearch },
                            fallbackResults: {
                                ...state.fallbackResults,
                                [description.title]: items.slice(0, MAX_LENGTH),
                            },
                        }));
                    } catch (error) {
                        console.error(`Error processing ${description.title}:`, error);
                    }
                })
            );
        } catch (error) {
            console.error('Error initializing submenu items:', error);
        } finally {
            set({ isLoading: false, initialLoadComplete: true });
        }
    },
}));

function getSubmenuSearchResults(
    minisearches: { [id: string]: MiniSearch },
    providerTitle: string | undefined,
    query: string
): SearchResult[] {
    if (providerTitle === undefined) {
        const results = Object.keys(minisearches).map((providerTitle) => {
            const results = minisearches[providerTitle].search(query, MINISEARCH_OPTIONS);
            return results.map((result) => ({ ...result, providerTitle }));
        });

        return results.flat().sort((a, b) => b.score - a.score);
    }

    if (!minisearches[providerTitle]) {
        return [];
    }

    return minisearches[providerTitle]
        .search(query, MINISEARCH_OPTIONS)
        .map((result) => ({ ...result, providerTitle }));
}
