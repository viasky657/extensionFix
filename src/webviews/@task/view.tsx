import { RequestViewItem } from 'components/exchange/request';
import { ResponseViewItem } from 'components/exchange/response';
import Tiptap from 'components/input/TipTapEditor';
import { TaskDD, TaskDL, TaskDT } from 'components/task-definition-list';
import * as React from 'react';
import { Navigate } from 'react-router-dom';
import { useSubmenuContext } from 'store/submenuContext';
import { cn } from 'utils/cn';
import { Exchange, Task, Usage, View } from '../../model';
import ClaudeLogo from '../assets/claude.svg';
import { ObjectEntry } from '../utils/types';
import { useTask } from './use-task';
import resolveEditorContent from 'components/input/resolveInput';

export function TaskView() {
  const task = useTask();
  const [summaryShown, setSummaryShown] = React.useState(false);
  const availableContextProviders = useSubmenuContext((state) => state.contextProviderDescriptions);

  if (task.data === undefined) {
    return <div>Loading...</div>;
  }

  if (!task.data.task || !task.data.task.preset) {
    return <Navigate to={`/${View.Preset}`} />;
  }

  const { exchanges, preset, cost, usage, query } = task.data.task;
  const isQueryEmpty = query === '';
  const showUsage = Object.keys(usage).length > 0;

  return (
    <main className="flex h-full flex-col">
      <header className="sticky top-0 z-10 bg-panel-background">
        <div>
          <div
            className="cursor-pointer select-none rounded-sm p-2"
            onClick={() => setSummaryShown(!summaryShown)}
          >
            <h2 className={cn(isQueryEmpty && 'text-base text-description')}>
              {isQueryEmpty ? 'New request' : query}
            </h2>
            {!summaryShown && (
              <dl className="flex items-baseline">
                <dt className="sr-only">Preset</dt>
                <dd className="mr-auto flex items-center text-description">
                  <ClaudeLogo width={12} height={12} className="mr-1" />
                  <span className="whitespace-nowrap">{preset.name}</span>
                </dd>
                {cost && (
                  <React.Fragment>
                    <dt className="sr-only">API cost</dt>
                    <dd>
                      <span>{cost}$</span>
                    </dd>
                  </React.Fragment>
                )}
              </dl>
            )}
          </div>
          <div className={cn(summaryShown ? 'block' : 'hidden', 'px-4 py-2')}>
            <TaskDL>
              <TaskDT>Query</TaskDT>
              <TaskDD className={cn(isQueryEmpty && 'No')}>
                {isQueryEmpty ? 'No query made yet' : query}
              </TaskDD>
              <TaskDT>Preset</TaskDT>
              <TaskDD>
                <ClaudeLogo width={12} height={12} className="mr-1" /> {preset.name}
              </TaskDD>
              {cost && (
                <React.Fragment>
                  <TaskDT>API cost</TaskDT>
                  <TaskDD>{cost}</TaskDD>
                </React.Fragment>
              )}
              {showUsage && (
                <React.Fragment>
                  <TaskDT>Data</TaskDT>
                  <TaskDD>
                    <ul>{(Object.entries(usage) as ObjectEntry<Usage>[]).map(renderUsagePart)}</ul>
                  </TaskDD>
                </React.Fragment>
              )}
            </TaskDL>
          </div>
        </div>
      </header>
      <div className={cn('flex flex-col gap-2', exchanges.length > 0 && 'flex-grow')}>
        <section className="flex-grow p-2">
          {exchanges && (
            <ol>
              {exchanges.map((exchange) => (
                <li key={exchange.exchangeId}>{renderExchange(exchange)}</li>
              ))}
            </ol>
          )}
        </section>
        <div className="sticky bottom-0 p-2">
          <Tiptap
            availableContextProviders={availableContextProviders ?? []}
            historyKey="chat"
            onEnter={async (editorState) => {
              const sessionId = task.data?.task.sessionId;
              if (sessionId === undefined) {
                return;
              }

              const [selectedContextItems, _, content] = await resolveEditorContent(editorState);
              const inputQuery = Array.isArray(content)
                ? content.map((c) => c.text).join('\n')
                : content;

              task.sendRequest(inputQuery, sessionId, selectedContextItems);

              // Clear the editor after sending
              editorState.editor.commands.clearContent();
            }}
          />
        </div>
      </div>
    </main>
  );
}

function renderExchange(exchange: Exchange) {
  switch (exchange.type) {
    case 'request':
      return <RequestViewItem {...exchange} />;
    case 'response':
      return <ResponseViewItem {...exchange} />;
  }
}

// Move this to dedicated part

function renderUsagePart(entry: ObjectEntry<Usage>) {
  const [key, value] = entry;
  switch (key) {
    case 'outputTokens':
      return (
        <li key={key}>
          <span aria-hidden className="codicon codicon-arrow-down" />
          {formatNumber(value)} <span className="sr-ony">tokens</span> output
        </li>
      );
    case 'inputTokens':
      return (
        <li key={key}>
          <span aria-hidden className="codicon codicon-arrow-up" />
          {formatNumber(value)} <span className="sr-ony">tokens</span> input
        </li>
      );
    case 'cacheReads':
      return (
        <li key={key}>
          <span aria-hidden className="codicon codicon-dashboard" />
          {formatNumber(value)} <span className="sr-ony">tokens in</span> cache reads
        </li>
      );
    case 'cacheWrites':
      return (
        <li key={key}>
          <span aria-hidden className="codicon codicon-database" />
          {formatNumber(value)} <span className="sr-ony">tokens in</span> cache writes
        </li>
      );
    default:
      return '';
  }
}

function formatNumber(n: number): string {
  if (n >= 1_000_000_000) {
    return (n / 1_000_000_000).toFixed(1) + 'B';
  } else if (n >= 1_000_000) {
    return (n / 1_000_000).toFixed(1) + 'M';
  } else if (n >= 1_000) {
    return (n / 1_000).toFixed(1) + 'K';
  } else {
    return n.toString();
  }
}
