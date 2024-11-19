import { RequestViewItem } from "components/exchange/request";
import { ResponseViewItem } from "components/exchange/response";
import Tiptap from "components/input/TipTapEditor";
import { TaskDD, TaskDL, TaskDT } from "components/task-definition-list";
import * as React from "react";
import { cn } from "utils/cn";
import { Exchange, Task, Usage } from "../../model";
import ClaudeLogo from "../assets/claude.svg";
import { ObjectEntry } from "../utils/types";
import { useSubmenuContext } from "store/submenuContext";

export interface TaskViewProps {
  task: Task;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
}

export function TaskView(props: TaskViewProps) {
  const { task, onSubmit } = props;
  const { exchanges, preset, cost, usage, query } = task;

  const [summaryShown, setSummaryShown] = React.useState(false);

  // TODO(g-danna) Improve this
  const showUsage = Object.keys(usage).length > 0; // usageKeys.some((key) => key in usage);

  const availableContextProviders = useSubmenuContext(state => state.contextProviderDescriptions);

  return (
    <main className="flex flex-col h-full">
      <header className="sticky top-0 bg-panel-background">
        <div>
          <div
            className="p-2 cursor-pointer hover:bg-[rgba(128,128,128,0.1)] rounded-sm select-none"
            onClick={() => setSummaryShown(!summaryShown)}
          >
            <h2>{query}</h2>
            <dl className="flex items-baseline">
              <dt className="sr-only">Preset</dt>
              <dd className="text-descriptionForeground mr-auto flex items-center">
                <ClaudeLogo width={12} height={12} className="mr-1" />
                <span className="whitespace-nowrap">
                  {preset.name}
                </span>
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
          </div>
          <div style={{ display: summaryShown ? 'block' : 'none' }} className="px-4 py-2">
            <TaskDL>
              <TaskDT>Query</TaskDT>
              {/* <TaskDD>{originalQuery}</TaskDD> */}
              <TaskDT>Preset</TaskDT>
              <TaskDD>{preset.name}</TaskDD>
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
                    <ul>
                      {(Object.entries(usage) as ObjectEntry<Usage>[]).map(
                        renderUsagePart
                      )}
                    </ul>
                  </TaskDD>
                </React.Fragment>
              )}
            </TaskDL>
          </div>
        </div>
      </header>
      <div className="flex flex-col gap-2 flex-grow">
        <section className="flex-grow p-2">
          {exchanges && (
            <ol>
              {exchanges.map((exchange) => (
                <li key={exchange.exchangeId}>{renderExchange(exchange)}</li>
              ))}
            </ol>
          )}
        </section>
        {/* <form className="sticky bottom-0 bg-panel-background flex flex-col gap-2 p-2" onSubmit={onSubmit} ref={formRef}>
          <Textarea
            className="w-full"
            name="query"
            onKeyDown={handleKeyDown}
          />
          <div className="flex justify-end">
            <Button type="submit">Send</Button>
          </div>
        </form> */}
        <div className="sticky bottom-0 p-2">
          <Tiptap
            availableContextProviders={availableContextProviders ?? []}
            historyKey="chat"
            onEnter={() => {
              // TODO(g-danna) Submit
            }}
          />
        </div>
      </div>
    </main>
  );
}

function renderExchange(exchange: Exchange) {
  switch (exchange.type) {
    case "request":
      return <RequestViewItem {...exchange} />;
    case "response":
      return <ResponseViewItem {...exchange} />;
  }
}

// Move this to dedicated part

function renderUsagePart(entry: ObjectEntry<Usage>) {
  const [key, value] = entry;
  switch (key) {
    case "outputTokens":
      return (
        <li key={key}>
          <span aria-hidden className="codicon codicon-arrow-down" />
          {formatNumber(value)} <span className="sr-ony">tokens</span> output
        </li>
      );
    case "inputTokens":
      return (
        <li key={key}>
          <span aria-hidden className="codicon codicon-arrow-up" />
          {formatNumber(value)} <span className="sr-ony">tokens</span> input
        </li>
      );
    case "cacheReads":
      return (
        <li key={key}>
          <span aria-hidden className="codicon codicon-dashboard" />
          {formatNumber(value)} <span className="sr-ony">tokens in</span> cache
          reads
        </li>
      );
    case "cacheWrites":
      return (
        <li key={key}>
          <span aria-hidden className="codicon codicon-database" />
          {formatNumber(value)} <span className="sr-ony">tokens in</span> cache
          writes
        </li>
      );
    default:
      return "";
  }
}

function formatNumber(n: number): string {
  if (n >= 1_000_000_000) {
    return (n / 1_000_000_000).toFixed(1) + "B";
  } else if (n >= 1_000_000) {
    return (n / 1_000_000).toFixed(1) + "M";
  } else if (n >= 1_000) {
    return (n / 1_000).toFixed(1) + "K";
  } else {
    return n.toString();
  }
}
