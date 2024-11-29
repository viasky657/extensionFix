import { cn } from 'utils/cn';

type TaskDLProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDListElement>,
  HTMLDListElement
>;

type HTMLElementProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;

export function TaskDL(props: TaskDLProps) {
  const { className, children, ...rest } = props;
  return (
    <div className={cn('relative text-description', className)}>
      <dl {...rest}>{children}</dl>
    </div>
  );
}

export function TaskDT(props: HTMLElementProps) {
  const { children, ...rest } = props;
  return (
    <dt className="mt-4 text-xs opacity-80 first:mt-0" {...rest}>
      {children}
    </dt>
  );
}

export function TaskDD(props: HTMLElementProps) {
  const { className, children, ...rest } = props;
  return (
    <dd className={cn(className, 'mt-1')} {...rest}>
      {children}
    </dd>
  );
}
