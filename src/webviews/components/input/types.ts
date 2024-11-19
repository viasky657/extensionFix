import { ContextProviderDescription } from "../../../context/providers/types";

export type ComboBoxItemType =
    | "contextProvider"
    | "file"
    | "query"
    | "folder"
    | "action";

interface ComboBoxSubAction {
    label: string;
    icon: string;
    action: (item: ComboBoxItem) => void;
}

export interface ComboBoxItem {
    title: string;
    description: string;
    id?: string;
    content?: string;
    type: ComboBoxItemType;
    contextProvider?: ContextProviderDescription;
    query?: string;
    label?: string;
    icon?: string;
    action?: () => void;
    subActions?: ComboBoxSubAction[];
}
