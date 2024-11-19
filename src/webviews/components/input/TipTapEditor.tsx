import Document from '@tiptap/extension-document'
import History from '@tiptap/extension-history'
import Paragraph from '@tiptap/extension-paragraph'
import Placeholder from '@tiptap/extension-placeholder'
import Text from '@tiptap/extension-text'
import { Editor, EditorContent, JSONContent, useEditor } from '@tiptap/react'
import { useInputHistory } from 'hooks/useInputHistory'
import useUpdatingRef from 'hooks/useUpdatingRef'
import { useRef } from 'react'
import { useSubmenuContext } from 'store/submenuContext'
import { ContextProviderDescription } from '../../../context/providers/types'
import { Mention } from './MentionExtension'
import { getContextProviderDropdownOptions } from './suggestions'

const InputBoxDiv = (
    { children }: { children: React.ReactNode }
) => {
    return (
        <div className={`flex min-h-[80px] w-full rounded-xs border border-input-border bg-input-background px-2 py-1 text-sm ring-offset-background  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}>
            {children}
        </div>
    );
}

interface TipTapEditorProps {
    availableContextProviders: ContextProviderDescription[];
    historyKey: string;
    onEnter: (editorState: JSONContent, editor: Editor) => void;
}

const Tiptap = (props: TipTapEditorProps) => {
    const getSubmenuContextItems = useSubmenuContext(state => state.getSubmenuContextItems);
    const availableContextProvidersRef = useUpdatingRef(
        props.availableContextProviders,
    );

    const inSubmenuRef = useRef<string | undefined>(undefined);
    const inDropdownRef = useRef(false);

    const enterSubmenu = async (editor: Editor, providerId: string) => {
        const contents = editor.getText();
        const indexOfAt = contents.lastIndexOf("@");
        if (indexOfAt === -1) {
            return;
        }

        // Find the position of the last @ character
        // We do this because editor.getText() isn't a correct representation including node views
        let startPos = editor.state.selection.anchor;
        while (
            startPos > 0 &&
            editor.state.doc.textBetween(startPos, startPos + 1) !== "@"
        ) {
            startPos--;
        }
        startPos++;

        editor.commands.deleteRange({
            from: startPos,
            to: editor.state.selection.anchor,
        });
        inSubmenuRef.current = providerId;

        // to trigger refresh of suggestions
        editor.commands.insertContent(":");
        editor.commands.deleteRange({
            from: editor.state.selection.anchor - 1,
            to: editor.state.selection.anchor,
        });
    };

    const onClose = () => {
        inSubmenuRef.current = undefined;
        inDropdownRef.current = false;
    };

    const onOpen = () => {
        inDropdownRef.current = true;
    };

    const { prevRef, nextRef, addRef } = useInputHistory(props.historyKey);

    const editor = useEditor({
        extensions: [
            Document,
            History,
            Placeholder.configure({
                placeholder: "Ask anything. Use '@' to add context"
            }),
            Paragraph.extend({
                addKeyboardShortcuts() {
                    return {
                        Enter: () => {
                            if (inDropdownRef.current) {
                                return false;
                            }

                            onEnterRef.current();
                            return true;
                        },
                        "Shift-Enter": () =>
                            this.editor.commands.first(({ commands }) => [
                                () => commands.newlineInCode(),
                                () => commands.createParagraphNear(),
                                () => commands.liftEmptyBlock(),
                                () => commands.splitBlock(),
                            ]),
                        ArrowUp: () => {
                            if (this.editor.state.selection.anchor > 1) {
                                return false;
                            }

                            const previousInput = prevRef.current(
                                this.editor.state.toJSON().doc,
                            );
                            if (previousInput) {
                                this.editor.commands.setContent(previousInput);
                                setTimeout(() => {
                                    this.editor.commands.blur();
                                    this.editor.commands.focus("start");
                                }, 0);
                                return true;
                            }

                            return false;
                        },
                        ArrowDown: () => {
                            if (
                                this.editor.state.selection.anchor <
                                this.editor.state.doc.content.size - 1
                            ) {
                                return false;
                            }
                            const nextInput = nextRef.current();
                            if (nextInput) {
                                this.editor.commands.setContent(nextInput);
                                setTimeout(() => {
                                    this.editor.commands.blur();
                                    this.editor.commands.focus("end");
                                }, 0);
                                return true;
                            }

                            return false;
                        },
                    };
                },
            }).configure({
                HTMLAttributes: {
                    class: "my-1",
                },
            }),
            Text,
            Mention.configure({
                HTMLAttributes: {
                    class: "mention",
                },
                suggestion: getContextProviderDropdownOptions(
                    availableContextProvidersRef,
                    getSubmenuContextItems,
                    enterSubmenu,
                    onClose,
                    onOpen,
                    inSubmenuRef,
                ),
                renderHTML: (props) => {
                    return `@${props.node.attrs.label || props.node.attrs.id}`;
                },
            })
        ],
        editorProps: {
            attributes: {
                class: "outline-none overflow-hidden h-full min-h-[60px]",
                style: `font-size: 14px;`,
            },
        },
        content: "",
    });

    const onEnterRef = useUpdatingRef(
        () => {
            if (!editor) {
                return;
            }

            const json = editor.getJSON();

            // Don't do anything if input box is empty
            if (!json.content?.some((c) => c.content)) {
                return;
            }

            props.onEnter(json, editor);

            const content = editor.state.toJSON().doc;
            addRef.current(content);
        },
        [props.onEnter, editor],
    );

    return (
        <div>
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
