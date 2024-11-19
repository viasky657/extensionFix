import { BaseContextProvider } from "./BaseContextProvider";
import { ContextItem, ContextProviderDescription, ContextProviderExtras, ContextSubmenuItem, LoadSubmenuItemsArgs } from "./types";

class CodeContextProvider extends BaseContextProvider {
    static override description: ContextProviderDescription = {
        title: "code",
        displayTitle: "Code",
        description: "Type to search",
        type: "submenu",
    };

    async getContextItems(
        _query: string,
        _extras: ContextProviderExtras,
    ): Promise<ContextItem[]> {
        // Assume the query is the id as returned by loadSubmenuItems
        return [];
    }

    override async loadSubmenuItems(
        _args: LoadSubmenuItemsArgs,
    ): Promise<ContextSubmenuItem[]> {
        return [];
    }
}

export default CodeContextProvider;
