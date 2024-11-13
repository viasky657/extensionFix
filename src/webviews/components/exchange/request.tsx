import { Request } from "../../../model";
import { ContextSummary } from "../context-summary";
import { Exchange, ExchangeHeader, ExchangeContent } from "./exchange-base";

export function RequestViewItem(props: Request) {
  const { username, message, context } = props;
  return (
    <Exchange>
      <ExchangeHeader className="font-medium">{username}</ExchangeHeader>
      <ExchangeContent>
        <p>{message}</p>
        {context && <ContextSummary context={context} />}
      </ExchangeContent>
    </Exchange>
  );
}
