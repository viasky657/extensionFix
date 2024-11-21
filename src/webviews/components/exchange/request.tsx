import { Request } from '../../../model';
import { ContextSummary } from '../context-summary';
import { Exchange, ExchangeHeader, ExchangeContent } from './exchange-base';

export function RequestViewItem(props: Request) {
  const { username, message, context } = props;
  return (
    <div className="mb-4 mt-2">
      <div className="flex">
        <div className="bg-activity-bar-background text-activity-bar-active-foreground mr-3 mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium leading-none">
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
