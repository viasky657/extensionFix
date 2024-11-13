import * as React from "react";
import { Response, ResponsePart } from "../../../model";
import MarkdownRenderer from "../markdown-renderer";
import { ContextSummary } from "../context-summary";
import { Exchange, ExchangeHeader, ExchangeContent } from "./exchange-base";

export function ResponseViewItem(props: Response) {
  const { username, parts, context } = props;
  return (
    <Exchange className="text-foreground">
      <ExchangeHeader className="text-textLink-foreground">
        {username}
      </ExchangeHeader>
      <ExchangeContent>
        {parts.map(renderPart)}
        {context && <ContextSummary context={context} />}
      </ExchangeContent>
    </Exchange>
  );
}

function renderPart(part: ResponsePart) {
  switch (part.type) {
    case "markdown":
      return <MarkdownRenderer rawMarkdown={part.markdown.value} />;
    case "commandGroup":
      return (
        <div>
          {part.commands.map((command) => (
            <vscode-button key={command.command}>{command.title}</vscode-button>
          ))}
        </div>
      );
  }
}
