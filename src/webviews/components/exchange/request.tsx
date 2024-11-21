import { Request } from '../../../model';
import { ContextSummary } from '../context-summary';
import { Exchange, ExchangeHeader, ExchangeContent } from './exchange-base';

export function RequestViewItem(props: Request) {
  const { username, message, context } = props;
  return (
    <div className="mb-4 mt-2">
      <div className="flex">
        <div className="mr-3 mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs font-medium text-white">
          Me
        </div>
        <Exchange className="flex-grow rounded bg-panel-background p-2">
          <ExchangeHeader>{username}</ExchangeHeader>
          <ExchangeContent>
            <p>{message}</p>
            {context.length > 0 && <ContextSummary context={context} />}
          </ExchangeContent>
        </Exchange>
      </div>
    </div>
  );
}
