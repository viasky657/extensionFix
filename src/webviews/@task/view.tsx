import * as React from "react";
import { Exchange, Task } from "../model";
import { ResponseViewItem } from "components/response";
import { RequestViewItem } from "components/request";

export interface TaskViewProps {
  task: Task;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
}

export function TaskView({ task, onSubmit }: TaskViewProps) {
  const { exchanges } = task;
  return (
    <main>
      <header></header>
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
