import { cn } from 'utils/cn';
import { SimpleHTMLElementProps } from '../../utils/types';

export function Exchange(props: SimpleHTMLElementProps<HTMLDivElement>) {
  const { className, children, ...rest } = props;
  return (
    <div className={cn(className, 'flex flex-col gap-2 text-foreground')} {...rest}>
      {children}
    </div>
  );
}

export function ExchangeHeader(props: SimpleHTMLElementProps<HTMLParagraphElement>) {
  const { children, className, ...rest } = props;
  return (
    <p className={cn(className, 'font-medium')} {...rest}>
      {children}
    </p>
  );
}

export function ExchangeContent(props: SimpleHTMLElementProps<HTMLDivElement>) {
  const { children, ...rest } = props;
  return <div {...rest}>{children}</div>;
}
