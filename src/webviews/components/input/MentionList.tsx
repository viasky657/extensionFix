import { Editor } from '@tiptap/react';
import FileIcon from 'components/fileicon';
import SafeImg from 'components/safeimg';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { ComboBoxItem, ComboBoxItemType } from './types';

const ICONS_FOR_DROPDOWN: { [key: string]: string } = {
  file: 'file',
  code: 'code',
};

export function getIconFromDropdownItem(id: string | undefined, type: ComboBoxItemType): string {
  if (id && ICONS_FOR_DROPDOWN[id]) {
    return ICONS_FOR_DROPDOWN[id];
  }
  return type === 'contextProvider' ? 'mention' : 'zap';
}

function DropdownIcon(props: { className?: string; item: ComboBoxItem }) {
  if (props.item.type === 'action') {
    return (
      <i className={`codicon codicon-add ${props.className || ''}`} style={{ fontSize: '1.2em' }} />
    );
  }

  const provider = props.item.type === 'contextProvider' ? props.item.id : props.item.type;

  const iconName = getIconFromDropdownItem(provider, props.item.type);

  const fallbackIcon = (
    <i
      className={`codicon codicon-${iconName} ${props.className || ''} flex-shrink-0`}
      style={{ fontSize: '1.2em' }}
    />
  );

  if (!props.item.icon) {
    return fallbackIcon;
  }

  return (
    <SafeImg
      className="flex-shrink-0 pr-2"
      src={props.item.icon}
      height="18em"
      width="18em"
      fallback={fallbackIcon}
    />
  );
}

interface MentionListProps {
  items: ComboBoxItem[];
  command: (item: any) => void;

  editor: Editor;
  enterSubmenu?: (editor: Editor, providerId: string) => void;
  onClose: () => void;
}

const MentionList = forwardRef((props: MentionListProps, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [subMenuTitle, setSubMenuTitle] = useState<string | undefined>(undefined);
  const [querySubmenuItem, setQuerySubmenuItem] = useState<ComboBoxItem | undefined>(undefined);

  const [allItems, setAllItems] = useState<ComboBoxItem[]>([]);
  useEffect(() => {
    const items = [...props.items];
    setAllItems(items);
  }, [subMenuTitle, props.items, props.editor]);

  const queryInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (queryInputRef.current) {
      queryInputRef.current.focus();
    }
  }, [querySubmenuItem]);

  const selectItem = (index: number) => {
    const item = allItems[index];

    if (item.type === 'action' && item.action) {
      item.action();
      return;
    }

    if (item.type === 'contextProvider' && item.contextProvider?.type === 'submenu') {
      setSubMenuTitle(item.description);
      if (props.enterSubmenu && item.id) {
        props.enterSubmenu(props.editor, item.id);
      }
      return;
    }

    if (item.contextProvider?.type === 'query') {
      // update editor to complete context provider title
      const { tr } = props.editor.view.state;
      const text = tr.doc.textBetween(0, tr.selection.from);
      const partialText = text.slice(text.lastIndexOf('@') + 1);
      const remainingText = item.title.slice(partialText.length);
      props.editor.view.dispatch(tr.insertText(remainingText, tr.selection.from));

      setSubMenuTitle(item.description);
      setQuerySubmenuItem(item);
      return;
    }

    if (item) {
      props.command({ ...item, itemType: item.type });
    }
  };

  const totalItems = allItems.length;

  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const upHandler = () => {
    setSelectedIndex((prevIndex) => {
      const newIndex = prevIndex - 1 >= 0 ? prevIndex - 1 : 0;
      itemRefs.current[newIndex]?.scrollIntoView({
        behavior: 'instant' as ScrollBehavior,
        block: 'nearest',
      });
      return newIndex;
    });
  };

  const downHandler = () => {
    setSelectedIndex((prevIndex) => {
      const newIndex = prevIndex + 1 < totalItems ? prevIndex + 1 : prevIndex;
      itemRefs.current[newIndex]?.scrollIntoView({
        behavior: 'instant' as ScrollBehavior,
        block: 'nearest',
      });
      return newIndex;
    });
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [allItems]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: React.KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }

      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }

      if (event.key === 'Enter' || event.key === 'Tab') {
        enterHandler();
        event.stopPropagation();
        event.preventDefault();
        return true;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        return true;
      }

      if (event.key === ' ') {
        if (allItems.length === 1) {
          enterHandler();
          return true;
        }
      }

      return false;
    },
  }));

  const showFileIconForItem = (item: ComboBoxItem) => {
    return ['file', 'code'].includes(item.type);
  };

  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, allItems.length);
  }, [allItems]);

  return (
    <div className="relative max-h-[330px] overflow-y-auto overflow-x-hidden rounded-sm border border-dropdown-border bg-dropdown-background text-sm shadow-lg">
      {querySubmenuItem ? (
        <textarea
          rows={1}
          ref={queryInputRef}
          className="font-inherit w-60 resize-none bg-input-background text-input-foreground focus:outline-none"
          placeholder={querySubmenuItem.description}
          onKeyDown={(e) => {
            if (queryInputRef.current && e.key === 'Enter') {
              if (e.shiftKey) {
                queryInputRef.current.innerText += '\n';
              } else {
                props.command({
                  ...querySubmenuItem,
                  itemType: querySubmenuItem.type,
                  query: queryInputRef.current.value,
                  label: `${querySubmenuItem.label}: ${queryInputRef.current.value}`,
                });
              }
            } else if (e.key === 'Escape') {
              setQuerySubmenuItem(undefined);
              setSubMenuTitle(undefined);
            }
          }}
        />
      ) : (
        <>
          {subMenuTitle && (
            <div className="block w-full cursor-pointer border border-transparent bg-dropdown-background p-1 text-left text-foreground">
              {subMenuTitle}
            </div>
          )}
          {allItems.length ? (
            allItems.map((item, index) => (
              <div
                className={`hover:bg-list-selection-background hover:text-list-selection-foreground m-0 block w-full cursor-pointer border border-transparent bg-opacity-100 px-1.5 py-0.5 text-left ${index === selectedIndex ? 'bg-list-selection-background text-list-selection-foreground' : 'bg-dropdown-background text-dropdown-foreground'}`}
                key={index}
                ref={(el) => (itemRefs.current[index] = el as HTMLButtonElement | null)}
                onClick={() => selectItem(index)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <span className="flex w-full items-center justify-between">
                  <div className="flex items-center justify-center">
                    {showFileIconForItem(item) ? (
                      <FileIcon height="20px" width="20px" filename={item.description} />
                    ) : (
                      <DropdownIcon item={item} className="mr-2" />
                    )}
                    <span title={item.id}>{item.title}</span>
                    {'  '}
                  </div>
                  <span className="float-right ml-2 flex min-w-[30px] items-center overflow-hidden overflow-ellipsis whitespace-nowrap text-right text-foreground">
                    {item.description}
                    {item.type === 'contextProvider' &&
                      item.contextProvider?.type === 'submenu' && (
                        <i
                          className="codicon codicon-chevron-right ml-2 flex-shrink-0"
                          style={{ fontSize: '1.2em' }}
                        />
                      )}
                  </span>
                </span>
              </div>
            ))
          ) : (
            <div className="m-0 block w-full cursor-pointer border border-transparent bg-dropdown-background px-1.5 py-0.5 text-left text-dropdown-foreground">
              No results
            </div>
          )}
        </>
      )}
    </div>
  );
});

export default MentionList;
