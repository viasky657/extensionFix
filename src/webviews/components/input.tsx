import * as React from 'react';
import { cn } from 'utils/cn';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'placeholder:text-input-placeholder-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-border focus-visible:ring-offset-2 focus-visible:ring-offset-panel-background disabled:opacity-50',
          'flex w-full rounded-xs border border-input-border bg-input-background px-2 py-1 text-sm',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
