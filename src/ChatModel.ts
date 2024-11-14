/*
import * as vscode from "vscode";
import {
  AideAgentResponseStream,
  AideAgentEditsInfo,
  AideAgentPlanInfo,
  AideCommand,
  AideAgentStreamingState,
  AideChatStep,
  AideAgentResponsePart,
  AideAgentThinkingForEdit,
  AideAgentPlanRegenerateInformation,
} from "./types";

export class Response implements AideAgentResponseStream {
  constructor() {}

  markdown(value: unknown): void {}
  anchor(value: unknown, title?: unknown): void {}
  filetree(value: unknown, baseUri: unknown): void {}
  progress(value: unknown, task?: unknown): void {}
  reference(value: unknown, iconPath?: unknown): void {}
  textEdit(
    target: vscode.Uri,
    edits: vscode.TextEdit | vscode.TextEdit[]
  ): void {}
  codeblockUri(uri: vscode.Uri): void {}
  confirmation(
    title: string,
    message: string,
    data: any,
    buttons?: string[]
  ): void {}
  warning(message: string | vscode.MarkdownString): void {}
  codeCitation(value: vscode.Uri, license: string, snippet: string): void {}

  editsInfo(edits: AideAgentEditsInfo) {}

  planInfo(plan: AideAgentPlanInfo) {}
  button(command: AideCommand) {}
  buttonGroup(commands: AideCommand[]) {}
  streamingState(state: AideAgentStreamingState) {}
  codeEdit(edits: vscode.WorkspaceEdit) {}
  step(step: AideChatStep) {}
  push(part: AideAgentResponsePart) {}
  thinkingForEdit(part: AideAgentThinkingForEdit) {}
  regeneratePlan(planInformation: AideAgentPlanRegenerateInformation) {}
  close() {}
}

class ChatModel {}
*/
