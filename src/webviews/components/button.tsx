import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from 'utils/cn';

const baseClassNames = [
  'focus-visible:outline-none focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-focus-border disabled:opacity-50',
  '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0', // Do these work?
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xs text-sm font-medium transition-colors',
];

const buttonVariants = cva(baseClassNames.join(' '), {
  variants: {
    variant: {
      primary:
        'bg-button-primary-background text-button-primary-foreground border border-button-primary-border hover:bg-button-primary-hover-background',
      secondary:
        'bg-button-secondary-background border border-button-secondary-background text-button-secondary-foreground hover:text-button-secondary-foreground hover:bg-button-secondary-hover-background',
      ghost:
        'btext-button-secondary-foreground hover:text-foreground hover:bg-button-secondary-hover-background',
    },
    size: {
      xs: 'px-1 py-0.5',
      sm: 'px-2 py-1',
      md: 'px-4 py-2',
      lg: 'rounded px-8 py-2',
      icon: 'h-10 w-10',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'sm',
  },
});

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
