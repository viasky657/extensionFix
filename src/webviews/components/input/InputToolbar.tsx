interface InputToolbarProps {
  disabled?: boolean;
  onAddContextItem?: () => void;
  onEnter: () => void;
  onClear: () => void;
  onCancel: () => void;
}

function InputToolbar(props: InputToolbarProps) {
  return (
    <div id="input-toolbar" className="flex items-center justify-between text-xs">
      <div className="flex items-center justify-start gap-2 whitespace-nowrap">
        <div className="items-center gap-1 text-gray-400 transition-colors duration-200">
          <div
            onClick={props.onAddContextItem}
            className="flex cursor-pointer items-center rounded text-foreground hover:bg-panel-background"
            role="button"
            tabIndex={0}
          >
            <span className="p-0.5 text-sm">@</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-0.5 whitespace-nowrap text-gray-400">
        <div
          className="flex cursor-pointer items-center justify-center rounded px-1.5 py-0.5 text-foreground hover:bg-panel-background disabled:cursor-wait"
          onClick={(e) => {
            props.onClear();
          }}
          role="button"
          tabIndex={0}
        >
          <span className="mr-[2px]">^L</span>
          <span className="text-disabled-foreground">Clear</span>
        </div>
        <div
          className="flex cursor-pointer items-center rounded px-1.5 py-0.5 text-foreground hover:bg-panel-background disabled:cursor-wait"
          onClick={(e) => {
            props.onEnter();
          }}
          role="button"
          tabIndex={0}
        >
          <span className="codicon codicon-newline mr-[2px]" />
          <span className="text-disabled-foreground">Send</span>
        </div>

        <div
          className="flex cursor-pointer items-center rounded px-1.5 py-0.5 text-foreground hover:bg-panel-background disabled:cursor-wait"
          onClick={(e) => {
            props.onCancel();
          }}
          role="button"
          tabIndex={0}
        >
          <span className="text-disabled-foreground">Cancel</span>
        </div>
      </div>
    </div>
  );
}

export default InputToolbar;
