import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';

export const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }: { className?: string }, ref: React.ForwardedRef<HTMLDivElement>) => (
  <SliderPrimitive.Root
    ref={ref}
    className={className}
    {...props}
  />
)); 