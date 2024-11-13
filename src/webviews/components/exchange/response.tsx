import * as React from "react";
import { Response, ResponsePart } from "../../../model";
import MarkdownRenderer from "../markdown-renderer";
import { ContextSummary } from "../context-summary";
import { Exchange, ExchangeHeader, ExchangeContent } from "./exchange-base";
import { VSCodeButton } from "vscode-elements/button";

export function ResponseViewItem(props: Response) {
  const { parts, context } = props;
  return (
    <Exchange>
      <ExchangeHeader className="text-textLink-foreground">
        SōtaPR
      </ExchangeHeader>
      <ExchangeContent>
        {parts.map(renderPart)}
        {context.length > 0 && <ContextSummary context={context} />}
      </ExchangeContent>
    </Exchange>
  );
}

function renderPart(part: ResponsePart, index: number) {
  switch (part.type) {
    case "markdown":
      return (
        <MarkdownRenderer
          key={`${part.type}-${index}`}
          rawMarkdown={part.rawMarkdown}
        />
      );
    case "commandGroup":
      return (
        <div key={`${part.type}-${index}`}>
          {part.commands.map((command) => (
            <VSCodeButton key={command.command}>{command.title}</VSCodeButton>
          ))}
        </div>
      );
  }
}
