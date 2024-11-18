import Document from '@tiptap/extension-document'
import History from '@tiptap/extension-history'
import Paragraph from '@tiptap/extension-paragraph'
import Placeholder from '@tiptap/extension-placeholder'
import Text from '@tiptap/extension-text'
import { EditorContent, useEditor } from '@tiptap/react'

const InputBoxDiv = (
    { children }: { children: React.ReactNode }
) => {
    return (
        <div className={`flex min-h-[80px] w-full rounded-xs border border-settings-textInputBackground bg-editor-background px-3 py-2 text-sm ring-offset-background  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}>
            {children}
        </div>
    );
}

const Tiptap = ({ className }: { className?: string }) => {
    const editor = useEditor({
        extensions: [
            Document,
            History,
            Placeholder.configure({
                placeholder: "Ask anything. Use '@' to add context"
            }),
            Paragraph.configure({
                HTMLAttributes: {
                    class: "my-1",
                },
            }),
            Text,
        ],
        editorProps: {
            attributes: {
                class: "outline-none overflow-hidden h-full min-h-[60px]",
                style: `font-size: 14px;`,
            },
        },
        content: "",
    });

    return (
        <div className={className}>
            <InputBoxDiv>
                <EditorContent
                    className="flex-1 h-full w-full"
                    spellCheck={false}
                    editor={editor}
                />
            </InputBoxDiv>
        </div>
    )
}

export default Tiptap
