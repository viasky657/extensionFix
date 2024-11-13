import { MarkdownString, Command } from "vscode";

// TODO split these into modules ?

export enum View {
  Task = "task",
  Preset = "preset",
  Welcome = "welcome",
  Settings = "settings",
  History = "history",
}

export type ViewType = `${View}`;

interface OpenTaskEvent {
  type: "open-task";
  task: Task;
}

interface TaskResponseEvent {
  type: "task-response";
  response: Response;
}

interface InitEvent {
  type: "init";
}

export type Event = OpenTaskEvent | TaskResponseEvent | InitEvent;

export type MarkdownResponsePart = {
  type: "markdown";
  markdown: MarkdownString;
};

export type CommandGroupResponsePart = {
  type: "commandGroup";
  commands: Command[];
};

export type ResponsePart = MarkdownResponsePart | CommandGroupResponsePart;

interface MessageBase {
  username: string;
  exchangeId: string;
  sessionId: string;
}

export interface Response extends MessageBase {
  type: "response";
  parts: ResponsePart[];
}

export interface Request extends MessageBase {
  type: "request";
  message: string;
}

export interface Task {
  sessionId: string;
  summary: string;
  preset: Preset;
  originalQuery: string;
  cost: number;
  usage: Record<string, number>; // metric, number of tokens
  context: any[]; // temporary,
  exchanges: Exchange[];
}

export type Exchange = Request | Response;

enum Provider {
  Anthropic = "anthropic",
  OpenAI = "open-ai",
  OpenRouter = "open-router",
  GoogleGemini = "google-geminbi",
  AWSBedrock = "aws-bedrock",
  OpenAICompatible = "open-ai-compatible",
  Ollama = "ollama",
}

type AnthropicModels =
  | "claude-3-5-sonnet-20241022"
  | "claude-3-5-haiku-20241022"
  | "claude-3-opus-20241022"
  | "claude-3-haiku-20241022";

type Model = AnthropicModels;

enum PermissionState {
  Always = "always",
  Ask = "ask",
  Never = "never",
}

type PermissionStateType = `${PermissionState}`;

type Permissions = Record<string, PermissionStateType>;

type ProviderType = `${Provider}`;

export interface Preset {
  provider: ProviderType;
  model: Model;
  apiKey: string;
  customBaseUrl?: string;
  permissions: Permissions;
  customInstructions: string;
  name: string;
}
