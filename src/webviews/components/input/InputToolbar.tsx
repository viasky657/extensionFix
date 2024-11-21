interface InputToolbarProps {
  disabled?: boolean;
  onAddContextItem?: () => void;
  onEnter?: () => void;
}

function InputToolbar(props: InputToolbarProps) {
  return (
    <div id="input-toolbar" className="flex items-center justify-between">
      <div className="flex items-center justify-start gap-2 whitespace-nowrap">
        <div className="items-center gap-1 text-gray-400 transition-colors duration-200">
          <div onClick={props.onAddContextItem} className="cursor-pointer px-1 py-0.5">
            <span className="codicon codicon-plus h-4 w-4" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 whitespace-nowrap text-gray-400">
        <div
          className="flex cursor-pointer items-center rounded px-1.5 py-0.5 text-foreground hover:bg-panel-background disabled:cursor-wait"
          onClick={(e) => {
            props.onEnter?.();
          }}
          role="button"
          tabIndex={0}
        >
          <span className="codicon codicon-newline mr-[2px]" />
          <span className="select-none">Send</span>
        </div>
      </div>
    </div>
  );
}

export default InputToolbar;
