import * as React from 'react';
import { cn } from 'utils/cn';
import { SimpleHTMLElementProps } from 'utils/types';
import { Spinner } from './spinner';

export type TerminalPreviewProps = SimpleHTMLElementProps<HTMLDivElement> & {
  busy: boolean;
  name?: string;
  lines: string[];
};

export function TerminalPreview(props: TerminalPreviewProps) {
  const { name, lines, className, busy, ...rest } = props;
  const hasOneLine = lines.length === 1;
  return (
    <div
      aria-busy={busy}
      className={cn(
        className,
        'flex-flex-col relative isolate whitespace-nowrap bg-terminal-background p-2 pt-2.5 text-xs text-terminal-foreground'
      )}
      {...rest}
    >
      <div className="absolute inset-0 -z-10 rounded-xs border border-terminal-border opacity-50" />
      <pre className={cn(hasOneLine ? 'flew-row' : 'flex-col', '-mt-0.5 flex gap-2')}>
        {name &&
          React.createElement(
            hasOneLine ? 'span' : 'p',
            { className: 'flex gap-1' },
            <React.Fragment>
              {busy ? (
                <Spinner className="h-3 w-3" />
              ) : (
                <span aria-hidden className="codicon codicon-terminal flex-shrink-0 opacity-50" />
              )}

              <span className="text-terminal-foreground opacity-75">name</span>
            </React.Fragment>
          )}
        {lines.map((line, i) => (
          <p key={i} className="overflow-auto">
            <span className="opacity-80">$</span> {line}
          </p>
        ))}
      </pre>
    </div>
  );
}
