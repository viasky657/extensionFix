import { Editor, ReactRenderer } from "@tiptap/react";
import { SuggestionOptions } from "@tiptap/suggestion";
import { MutableRefObject } from "react";
import tippy from "tippy.js";
import { ContextProviderDescription, ContextSubmenuItem } from "../../../context/providers/types";
import MentionList from "./MentionList";
import { ComboBoxItem, ComboBoxItemType } from "./types";

export function getContextProviderDropdownOptions(
    availableContextProvidersRef: MutableRefObject<ContextProviderDescription[]>,
    getSubmenuContextItems: (providerTitle: string | undefined, query: string) => (ContextSubmenuItem & { providerTitle: string })[],
    enterSubmenu: (editor: Editor, providerId: string) => void,
    onClose: () => void,
    onOpen: () => void,
    inSubmenu: MutableRefObject<string | undefined>,
) {
    const items = async ({ query }: { query: string }) => {
        if (inSubmenu.current) {
            const results = getSubmenuContextItems(
                inSubmenu.current,
                query,
            );
            return results.map((result) => {
                return {
                    ...result,
                    label: result.title,
                    type: inSubmenu.current as ComboBoxItemType,
                    query: result.id,
                };
            });
        }

        const mainResults: any[] =
            availableContextProvidersRef.current?.filter(
                (provider) =>
                    provider.title.toLowerCase().includes(query.toLowerCase()) ||
                    provider.displayTitle.toLowerCase().includes(query.toLowerCase())
            )
                .map((provider) => ({
                    name: provider.displayTitle,
                    description: provider.description,
                    id: provider.title,
                    title: provider.displayTitle,
                    label: provider.displayTitle,
                    renderInlineAs: provider.renderInlineAs,
                    type: "contextProvider" as ComboBoxItemType,
                    contextProvider: provider,
                }))
                .sort((c, _) => (c.id === "file" ? -1 : 1)) || [];

        if (mainResults.length === 0) {
            const results = getSubmenuContextItems(undefined, query);
            return results.map((result) => {
                return {
                    ...result,
                    label: result.title,
                    type: result.providerTitle as ComboBoxItemType,
                    query: result.id,
                    icon: result.icon,
                };
            });
        }

        return mainResults;
    };

    return getSuggestions(items, enterSubmenu, onClose, onOpen);
}

function getSuggestions(
    items: (props: { query: string }) => Promise<ComboBoxItem[]>,
    enterSubmenu: (editor: Editor, providerId: string) => void = (editor) => { },
    onClose: () => void = () => { },
    onOpen: () => void = () => { }
): Omit<SuggestionOptions, "editor"> {
    return {
        items,
        allowSpaces: true,
        render: () => {
            let component: any;
            let popup: any;

            const onExit = () => {
                popup?.[0]?.destroy();
                component?.destroy();
                onClose();
            };

            return {
                onStart: (props: any) => {
                    component = new ReactRenderer(MentionList, {
                        props: { ...props, enterSubmenu, onClose: onExit },
                        editor: props.editor,
                    });

                    if (!props.clientRect) {
                        console.log("no client rect");
                        return;
                    }

                    popup = tippy("body", {
                        getReferenceClientRect: props.clientRect,
                        appendTo: () => document.body,
                        content: component.element,
                        showOnCreate: true,
                        interactive: true,
                        trigger: "manual",
                        placement: "bottom-start",
                        maxWidth: `${window.innerWidth - 24}px`,
                    });

                    onOpen();
                },

                onUpdate(props: any) {
                    component.updateProps({ ...props, enterSubmenu });

                    if (!props.clientRect) {
                        return;
                    }

                    popup[0].setProps({
                        getReferenceClientRect: props.clientRect,
                    });
                },

                onKeyDown(props: any) {
                    if (props.event.key === "Escape") {
                        popup[0].hide();

                        return true;
                    }

                    return component.ref?.onKeyDown(props);
                },

                onExit,
            };
        },
    };
}
