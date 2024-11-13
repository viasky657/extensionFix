import { SimpleHTMLElementProps } from "../../../utils/types";

export function Exchange(props: SimpleHTMLElementProps<HTMLDivElement>) {
  const { children, ...rest } = props;
  return (
    <div className="text-foreground flex flex-col gap-2" {...rest}>
      {children}
    </div>
  );
}

export function ExchangeHeader(
  props: SimpleHTMLElementProps<HTMLParagraphElement>
) {
  const { children, ...rest } = props;
  return <p {...rest}>{children}</p>;
}

export function ExchangeContent(props: SimpleHTMLElementProps<HTMLDivElement>) {
  const { children, ...rest } = props;
  return <div {...rest}>{children}</div>;
}
