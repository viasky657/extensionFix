type TaskDLProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDListElement>,
  HTMLDListElement
>;

type HTMLElementProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement>,
  HTMLElement
>;

export function TaskDL(props: TaskDLProps) {
  const { children, ...rest } = props;
  return <dl {...rest}>{children}</dl>;
}

export function TaskDT(props: HTMLElementProps) {
  const { children, ...rest } = props;
  return <dd {...rest}>{children}</dd>;
}

export function TaskDD(props: HTMLElementProps) {
  const { children, ...rest } = props;
  return <dd {...rest}>{children}</dd>;
}
