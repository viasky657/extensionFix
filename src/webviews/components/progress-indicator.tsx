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
      className={cn(className, '-mx-3')}
      {...rest}
    >
      <div className="animate-translate-lr relative h-0.5 w-full">
        <div className="bg-progress-bar-background absolute right-0 h-full w-3" />
      </div>
    </div>
  );
}
