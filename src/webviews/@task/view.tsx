import * as React from "react";
import { VSCodeBadge } from "vscode-elements/badge";
import { VSCodeButton } from "vscode-elements/button";
import { VSCodeTextArea } from "vscode-elements/textarea";

import { RequestViewItem } from "components/exchange/request";
import { ResponseViewItem } from "components/exchange/response";
import { TaskDD, TaskDL, TaskDT } from "components/task-definition-list";
import { Exchange, Task, Usage } from "../../model";
import ClaudeLogo from "../assets/claude.svg";
import { ObjectEntry } from "../utils/types";

export interface TaskViewProps {
  task: Task;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
}

export function TaskView(props: TaskViewProps) {
  const { task, onSubmit } = props;
  const { exchanges, summary, preset, cost, usage, originalQuery } = task;

  // TODO(g-danna) Improve this
  const showUsage = Object.keys(usage).length > 0; // usageKeys.some((key) => key in usage);

  return (
    <main className="flex flex-col flex-grow">
      <header>
        <details>
          <summary>
            <h2>{summary}</h2>
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
                    <VSCodeBadge variant="counter">{cost}$</VSCodeBadge>
                  </dd>
                </React.Fragment>
              )}
            </dl>
          </summary>
          <TaskDL>
            <TaskDT>Query</TaskDT>
            <TaskDD>{originalQuery}</TaskDD>
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
        </details>
      </header>
      <section className="flex-grow">
        {exchanges && (
          <ol>
            {exchanges.map((exchange) => (
              <li key={exchange.exchangeId}>{renderExchange(exchange)}</li>
            ))}
          </ol>
        )}
      </section>
      <form onSubmit={onSubmit}>
        <VSCodeTextArea className="w-full" name="query" />
        <VSCodeButton type="submit">Send</VSCodeButton>
      </form>
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
