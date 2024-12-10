import * as React from 'react';
import { Task, ResponsePart } from '../../model';
import { useLoaderData } from 'react-router-dom';
import { LoaderData } from 'utils/types';
import { formatDistanceToNow } from 'date-fns';
import { Spinner } from 'components/spinner';

type ViewData = {
  history: Task[];
};

export async function loadHistory(): Promise<ViewData> {
  try {
    vscode.postMessage({ type: 'get-history' });
    
    const response = await new Promise<Task[]>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('History loading timeout')), 5000);
      
      const handler = (event: MessageEvent) => {
        const data = event.data as { type: 'get-history/response', history: Task[] };
        if (data.type === 'get-history/response') {
          clearTimeout(timeout);
          window.removeEventListener('message', handler);
          resolve(data.history);
        }
      };
      window.addEventListener('message', handler);
    });

    return { history: response };
  } catch (error) {
    console.error('Failed to load history:', error);
    return { history: [] };
  }
}

export function HistoryView() {
  const { history } = useLoaderData() as LoaderData<typeof loadHistory>;
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    setIsLoading(false);
  }, [history]);

  if (isLoading) {
    return <div className="flex justify-center p-4"><Spinner /></div>;
  }

  return (
    <main className="flex flex-grow flex-col px-3 py-2">
      <header className="flex items-baseline gap-2">
        <h2 className="mr-auto text-base text-description">Chat History</h2>
      </header>
      
      <div className="mt-4">
        {history.length === 0 ? (
          <p className="text-description">No chat history yet</p>
        ) : (
          <ol className="space-y-4">
            {history.map((task) => {
              return <HistoryItem task={task} key={task.sessionId} />;
            })}
          </ol>
        )}
      </div>
    </main>
  );
}

interface HistoryItemProps {
  task: Task;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ task }: { task: Task }) => {
  const timestamp = new Date(task.exchanges[0]?.exchangeId || Date.now());
  
  // Get all response parts that contain tool actions
  const toolActions = task.exchanges
    .filter(exchange => exchange.type === 'response')
    .reduce((acc, exchange) => [...acc, ...exchange.parts], [] as ResponsePart[])
    .filter(part => 
      'toolType' in part || 
      'command' in part || 
      'edits' in part
    );
  
  return (
    <li className="group relative rounded-md border border-panel-border p-4 hover:border-foreground">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium text-foreground">{task.query}</h3>
          <p className="mt-1 text-sm text-description">
            {formatDistanceToNow(timestamp, { addSuffix: true })}
          </p>
        </div>
        <div className="text-sm text-description">
          {task.exchanges.length} messages
        </div>
      </div>
      
      {toolActions.length > 0 && (
        <div className="mt-2 text-sm text-description">
          <p>Actions taken:</p>
          <ul className="list-disc pl-4">
            {toolActions.map((action, i) => (
              <li key={i}>
                {'toolType' in action && `Used ${action.toolType}`}
                {'command' in action && `Ran command: ${action.command}`}
                {'edits' in action && `Made file edits`}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="mt-2 text-sm">
        <p className="line-clamp-2 text-description">
          {(task.exchanges[task.exchanges.length - 1] as unknown as ResponsePart[])?.find(part => 'rawMarkdown' in part)?.rawMarkdown || 'No response yet'}
        </p>
      </div>
    </li>
  );
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      main: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      header: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      h2: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
      h3: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
      p: React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>;
      ol: React.DetailedHTMLProps<React.OlHTMLAttributes<HTMLOListElement>, HTMLOListElement>;
      ul: React.DetailedHTMLProps<React.UlHTMLAttributes<HTMLUListElement>, HTMLUListElement>;
      div: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
      li: React.DetailedHTMLProps<React.LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>;
    }
  }
}

declare const vscode: {
  postMessage: (message: any) => void;
}; 