import * as RUISelect from "@radix-ui/react-select";
import * as React from "react";
import { cn } from "utils/cn";

export type SelectProps = RUISelect.SelectProps & {
  className?: string;
  id?: string;
}

export function Select(props: SelectProps) {
  const { children, className, ...rest } = props
  return (
    <RUISelect.Root {...rest}>
      <RUISelect.Trigger className={cn(className, "flex items-start p-1 bg-settings-dropdownBackground text-settings-dropdownForeground rounded mr-auto gap-2")}>
        <RUISelect.Value className="mr-auto" />
        <span aria-hidden className="codicon codicon-chevron-down flex-shrink-0 translate-y-0.5" />
      </RUISelect.Trigger>

      <RUISelect.Portal>
        <RUISelect.Content className="bg-settings-dropdownBackground border border-settings-dropdownListBorder rounded">
          <RUISelect.ScrollUpButton />
          <RUISelect.Viewport>
            {children}
          </RUISelect.Viewport>
          <RUISelect.ScrollDownButton />
          <RUISelect.Arrow />
        </RUISelect.Content>
      </RUISelect.Portal>
    </RUISelect.Root>
  )
}



export type OptionProps = RUISelect.SelectItemProps

export function Option(props: OptionProps) {
  const { className, ...rest } = props
  return (
    <RUISelect.Item className="p-1 hover:bg-list-activeSelectionBackground hover:text-list-activeSelectionForeground" {...rest}>
      <RUISelect.ItemText>
        {props.value}
      </RUISelect.ItemText>
      <RUISelect.ItemIndicator />
    </RUISelect.Item>
  );
}