import { cn } from 'utils/cn';
import { SimpleHTMLElementProps } from 'utils/types';

type CostIconProps = SimpleHTMLElementProps<HTMLSpanElement>;

export function CostIcon(props: CostIconProps) {
  const { className, ...rest } = props;
  return (
    <span
      aria-hidden
      className={cn(
        'flex h-3.5 w-3.5 items-center justify-center rounded-xs border border-badge-background bg-input-background',
        className
      )}
      {...rest}
    >
      <span className="pointer-events-none scale-90 select-none text-xs text-badge-background">
        $
      </span>
    </span>
  );
}
