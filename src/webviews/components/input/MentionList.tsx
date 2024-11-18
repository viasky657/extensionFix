import { Editor } from "@tiptap/react";
import { forwardRef } from "react";
import { ComboBoxItem } from "./types";


interface MentionListProps {
    items: ComboBoxItem[];
    command: (item: any) => void;

    editor: Editor;
    enterSubmenu?: (editor: Editor, providerId: string) => void;
    onClose: () => void;
}

const MentionList = forwardRef((props: MentionListProps, ref) => {
    return <div>
    </div>
});

export default MentionList;
