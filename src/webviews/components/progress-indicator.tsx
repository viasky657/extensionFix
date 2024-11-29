// VSCode-like progress indicator

import { cn } from 'utils/cn';
import { SimpleHTMLElementProps } from 'utils/types';

type ProgressIndicatorProps = SimpleHTMLElementProps<HTMLDivElement> & {
  label?: string;
};

export function ProgressIndicator(props: ProgressIndicatorProps) {
  const { className, label = 'Loading...', ...rest } = props;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-busy
      className={cn('-mx-3', className)}
      {...rest}
    >
      <div className="relative h-0.5 w-full animate-translate-lr">
        <div className="absolute right-0 h-full w-3 bg-progress-bar-background" />
      </div>
    </div>
  );
}
