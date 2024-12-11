import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';

const Slider = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className }: { className?: string }, ref: React.ForwardedRef<HTMLSpanElement>) => (
  <SliderPrimitive.Root
    ref={ref}
    className={className}
  />
));
Slider.displayName = "Slider";

export { Slider }; 