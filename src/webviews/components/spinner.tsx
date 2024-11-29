import { cn } from 'utils/cn';
import { SimpleHTMLElementProps } from 'utils/types';

export const Spinner = ({ className, ...rest }: SimpleHTMLElementProps<HTMLDivElement>) => (
  <div
    className={cn(
      'h-4 w-4 animate-spin rounded-full border-2 border-transparent border-b-progress-bar-background',
      className
    )}
    {...rest}
  />
);
