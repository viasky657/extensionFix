import * as RUISelect from '@radix-ui/react-select';
import * as React from 'react';
import { cn } from 'utils/cn';

export type SelectProps = RUISelect.SelectProps & {
  className?: string;
  id?: string;
};

export function Select(props: SelectProps) {
  const { children, className, ...rest } = props;
  return (
    <RUISelect.Root {...rest}>
      <RUISelect.Trigger
        className={cn(
          'mr-auto flex items-start gap-2 rounded border border-dropdown-border bg-dropdown-background px-2 py-1 text-dropdown-foreground hover:bg-button-primary-hover-background hover:text-button-primary-foreground',
          className
        )}
      >
        <RUISelect.Value />
        <span
          aria-hidden
          className="codicon codicon-chevron-down ml-auto flex-shrink-0 translate-y-0.5"
        />
      </RUISelect.Trigger>

      <RUISelect.Portal>
        <RUISelect.Content className="rounded-xs border border-dropdown-border bg-dropdown-background">
          <RUISelect.ScrollUpButton />
          <RUISelect.Viewport>{children}</RUISelect.Viewport>
          <RUISelect.ScrollDownButton />
          <RUISelect.Arrow />
        </RUISelect.Content>
      </RUISelect.Portal>
    </RUISelect.Root>
  );
}

export type OptionProps = RUISelect.SelectItemProps;

export function Option(props: OptionProps) {
  const { className, children, ...rest } = props;
  return (
    <RUISelect.Item
      className="px-2 py-1 hover:bg-button-primary-hover-background hover:text-button-primary-foreground"
      {...rest}
    >
      <RUISelect.ItemText>{children}</RUISelect.ItemText>
      <RUISelect.ItemIndicator />
    </RUISelect.Item>
  );
}
