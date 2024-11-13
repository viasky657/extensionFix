import * as React from "react";
import * as vscode from "vscode";
import { Exchange, Task } from "../../model";
import { ResponseViewItem } from "components/response";
import { RequestViewItem } from "components/request";
import { TaskDL, TaskDT, TaskDD } from "components/task-definition-list";

export interface TaskViewProps {
  task: Task;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
}

export function TaskView({ task, onSubmit }: TaskViewProps) {
  const { exchanges, summary, preset, cost, usage, originalQuery } = task;

  // TODO(g-danna) Improve this
  const showUsage = Object.keys(usage).length > 0; // usageKeys.some((key) => key in usage);

  return (
    <main>
      <header>
        <details>
          <summary>
            <h2>{summary}</h2>
            <dl>
              <dt className="sr-only">Preset</dt>
              <dd>{preset.name}</dd>
              {usage.cost && (
                <React.Fragment>
                  <dt className="sr-only">API cost</dt>
                  <dd>{usage.cost}</dd>
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
                  <ul>{Object.entries(usage).map(renderUsagePart)}</ul>
                </TaskDD>
              </React.Fragment>
            )}
          </TaskDL>
        </details>
      </header>
      <section>
        {exchanges && (
          <ol>
            {exchanges.map((exchange) => (
              <li key={exchange.exchangeId}>{renderExchange(exchange)}</li>
            ))}
          </ol>
        )}
      </section>
      <form onSubmit={onSubmit}>
        <vscode-textarea></vscode-textarea>
        <vscode-button type="submit">Send</vscode-button>
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

//const usageKeys = ["output", "input", "cache-reads", "cache-writes"];

function renderUsagePart(entry: [string, number]) {
  const [key, value] = entry;
  switch (key) {
    case "output":
      return (
        <li>
          <span aria-hidden className="codicon codicon-arrow-down" />
          {formatNumber(value)} <span className="sr-ony">tokens</span> output
        </li>
      );
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
