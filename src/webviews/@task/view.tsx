import { Button } from 'components/button';
import { RequestViewItem } from 'components/exchange/request';
import { ResponseViewItem } from 'components/exchange/response';
import resolveEditorContent from 'components/input/resolveInput';
import Tiptap from 'components/input/TipTapEditor';
import { PresetLogo } from 'components/preset';
import { TaskDD, TaskDL, TaskDT } from 'components/task-definition-list';
import * as React from 'react';
import { Navigate } from 'react-router-dom';
import { useSubmenuContext } from 'store/submenuContext';
import { cn } from 'utils/cn';
import { Exchange, View } from '../../model';
import { useTask } from './use-task';

export function TaskView() {
  const task = useTask();
  const [summaryShown, setSummaryShown] = React.useState(false);
  const availableContextProviders = useSubmenuContext((state) => state.contextProviderDescriptions);

  const [showActions, setShowActions] = React.useState(false);

  const acceptButtonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (showActions && acceptButtonRef.current) {
      acceptButtonRef.current.focus();
    }
  }, [showActions]);

  function onUserSaysNo() {
    if (task.data) {
      task.sendRequest('No', task.data.task.sessionId, []);
    }
  }

  function onUserSaysYes() {
    if (task.data) {
      task.sendRequest('Yes', task.data.task.sessionId, []);
    }
  }

  if (task.data === undefined) {
    return <div>Loading...</div>;
  }

  if (!task.data.task || !task.data.task.preset) {
    return <Navigate to={`/${View.Preset}`} />;
  }

  const { exchanges, preset, query } = task.data.task;
  const isQueryEmpty = query === '';

  return (
    <main className="flex h-full flex-col">
      <header className="sticky top-0 z-10 bg-panel-background py-2 pl-[18px] pr-[12px]">
        <div className="group">
          <div
            className="mb-2 flex cursor-pointer select-none items-center justify-between"
            onClick={() => setSummaryShown(!summaryShown)}
          >
            <h2 className="text-base text-description">{isQueryEmpty ? 'New request' : query}</h2>
            <span
              className={cn(
                'codicon',
                summaryShown ? 'codicon-chevron-up' : 'codicon-chevron-down',
                'ml-2 flex-shrink-0'
              )}
            />
          </div>
          {!summaryShown ? (
            <dl className="flex items-baseline">
              <dt className="sr-only">Preset</dt>
              <dd className="mr-auto flex items-center text-description">
                <PresetLogo provider={preset.provider} className="mr-1 h-3 w-3" />
                <span className="whitespace-nowrap">{preset.name}</span>
              </dd>
              {/* {cost && (
                <React.Fragment>
                  <dt className="sr-only">API cost</dt>
                  <dd>
                    <span>{cost}$</span>
                  </dd>
                </React.Fragment>
              )} */}
            </dl>
          ) : (
            <TaskDL>
              <TaskDT>Query</TaskDT>
              <TaskDD className={cn(isQueryEmpty && 'No')}>
                {isQueryEmpty ? 'No query made yet' : query}
              </TaskDD>
              <TaskDT>Preset</TaskDT>
              <TaskDD>
                <span className="flex gap-1">
                  <PresetLogo
                    provider={preset.provider}
                    className="h-3 w-3 flex-shrink-0 translate-y-0.5"
                  />
                  {preset.name}
                </span>
              </TaskDD>
              {/* <React.Fragment>
              <TaskDT>API cost</TaskDT>
              <TaskDD className="flex gap-1">
                <CostIcon className="translate-y-0.5" />
                {cost}$
              </TaskDD>
            </React.Fragment>
            {showUsage && (
              <React.Fragment>
                <TaskDT>Data</TaskDT>
                <TaskDD className="mt-1">
                  <UsageList usage={usage} />
                </TaskDD>
              </React.Fragment>
            )} */}
            </TaskDL>
          )}
        </div>
      </header>
      <div className="flex flex-grow flex-col gap-2 overflow-x-hidden overflow-y-scroll">
        <section className="flex-grow px-3 py-2">
          {exchanges && (
            <ol>
              {exchanges.map((exchange) => (
                <li key={exchange.exchangeId}>{renderExchange(exchange)}</li>
              ))}
            </ol>
          )}
        </section>
        <div className="bg-sidebar-background sticky bottom-0 p-2">
          {showActions && (
            <div
              aria-live="assertive"
              aria-hidden={!showActions}
              className={cn(
                showActions ? 'translate-y-1/2 opacity-100' : 'translate-y-0 opacity-0',
                'mb-2 flex gap-2 transition-all duration-150 ease-in-out'
              )}
            >
              <Button
                onClick={onUserSaysYes}
                ref={acceptButtonRef}
                type="button"
                className="flex flex-grow items-start gap-2"
              >
                <span
                  aria-hidden
                  className="codicon codicon-thumbsup-filled -ml-1 translate-y-0.5"
                />
                Yes
              </Button>
              <Button
                onClick={onUserSaysNo}
                type="button"
                variant="secondary"
                className="flex flex-grow items-start gap-2"
              >
                <span aria-hidden className="codicon codicon-thumbsdown -ml-1 translate-y-0.5" />
                No
              </Button>
            </div>
          )}
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
