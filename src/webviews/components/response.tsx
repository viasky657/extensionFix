import { Command } from "vscode";
import * as React from "react";
import { marked } from "marked";
import { Response, ResponsePart } from "model";

export function ResponseViewItem({ username, parts }: Response) {
  return (
    <div>
      <p>{username}</p>
      {parts.map(renderPart)}
    </div>
  );
}

function renderPart(part: ResponsePart) {
  switch (part.type) {
    case "markdown":
      return marked.parse(part.markdown);
    case "commandGroup":
      return renderButtons(part.commands);
  }
}

function renderButtons(commands: Command[]) {
  return (
    <div>
      {commands.map((command) => (
        <vscode-button key={command.command}>{command.title}</vscode-button>
      ))}
    </div>
  );
}
