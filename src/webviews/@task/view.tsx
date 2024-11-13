import * as React from "react";
import { Exchange, Task } from "../../model";
import { ResponseViewItem } from "components/response";
import { RequestViewItem } from "components/request";
import { TaskDL, TaskDT, TaskDD } from "components/task-definition-list";

export interface TaskViewProps {
  task: Task;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
}

export function TaskView({ task, onSubmit }: TaskViewProps) {
  const { exchanges, summary, preset, usage } = task;
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
            <TaskDT className="sr-only">Preset</TaskDT>
            <TaskDD>{preset.name}</TaskDD>
            {usage.cost && (
              <React.Fragment>
                <TaskDT className="sr-only">API cost</TaskDT>
                <TaskDD>{usage.cost}</TaskDD>
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
