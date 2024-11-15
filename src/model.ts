// TODO split these into modules ?

export enum View {
  Task = "task",
  Preset = "preset",
  Welcome = "welcome",
  Settings = "settings",
  History = "history",
}

export type ViewType = `${View}`;

interface TaskFeedback {
  type: 'task-feedback',
  query: string,
  sessionId: string,
}

interface OpenTaskEvent {
  type: "open-task";
  task: Task;
}

interface TaskResponseEvent {
  type: "task-response";
  response: Response;
}

interface InitRequest {
  type: "init";
}

interface InitResponse {
  type: "init-response";
  task: Task;
  view: ViewType;
  isSidecarReady: boolean;
}

interface InitialState {
  type: 'initial-state';
  initialAppState: AppState;
}

interface TaskUpdate {
  type: 'task-update',
  currentTask: Task,
}

interface SidecarReadyState {
  type: 'sidecar-ready-state',
  isSidecarReady: boolean,
}

export type Event = OpenTaskEvent | TaskResponseEvent | InitRequest | InitResponse | TaskFeedback | InitialState | TaskUpdate | SidecarReadyState;

export type NewSessionRequest = {
  type: "new-request";
  query: string;
  exchangeId: string;
};

// For now the client request is also an event which we have over here
export type ClientRequest = Event;

export type MarkdownResponsePart = {
  type: "markdown";
  rawMarkdown: string;
};

export type Command = {
  command: string;
  title: string;
};

export type CommandGroupResponsePart = {
  type: "commandGroup";
  commands: Command[];
};

export type ToolThinkingResponsePart = {
  type: 'toolThinking',
  // this is the full tool thinking always
  markdown: MarkdownResponsePart,
}

export type ToolParameterResponsePart = {
  type: "toolParameter",
  toolParameters: {
    parameterName: string,
    contentDelta: string,
    contentUpUntilNow: string,
  }
}

export type ToolThinkingToolTypeEnum = 'ListFiles' |
  'SearchFileContentWithRegex' |
  'OpenFile' |
  'CodeEditing' |
  'LSPDiagnostics' |
  'AskFollowupQuestions' |
  'AttemptCompletion' |
  'RepoMapGeneration';

export type ToolThinkingToolTypeResponsePart = {
  type: 'toolType',
  toolType: ToolThinkingToolTypeEnum,
}

export type ResponsePart = MarkdownResponsePart | CommandGroupResponsePart | ToolThinkingResponsePart | ToolThinkingToolTypeResponsePart | ToolParameterResponsePart;

interface MessageBase {
  username: string;
  exchangeId: string;
  sessionId: string;
  context: string[];
}

export interface Response extends MessageBase {
  type: "response";
  parts: ResponsePart[];
}

export interface Request extends MessageBase {
  type: "request";
  message: string;
}

export interface Usage {
  inputTokens: number;
  outputTokens: number;
  cacheReads: number;
  cacheWrites: number;
}

export interface Task {
  sessionId: string;
  preset: Preset;
  responseOnGoing: boolean;
  cost: number;
  usage: Usage; // metric, number of tokens
  context: any[]; // temporary,
  exchanges: Exchange[];
}

export type Exchange = Request | Response;

export enum Provider {
  Anthropic = "anthropic",
  OpenAI = "open-ai",
  OpenRouter = "open-router",
  GoogleGemini = "google-geminbi",
  AWSBedrock = "aws-bedrock",
  OpenAICompatible = "open-ai-compatible",
  Ollama = "ollama",
}

export const ANTHROPIC_MODELS = [
  "claude-3-5-sonnet-20241022",
  "claude-3-5-haiku-20241022",
  "claude-3-opus-20241022",
  "claude-3-haiku-20241022",
] as const;

type AnthropicModels = typeof ANTHROPIC_MODELS[number];

type Model = AnthropicModels;

export enum PermissionState {
  Always = "always",
  Ask = "ask",
  // Never = "never",
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

export interface AppState {
  extensionReady: boolean;
  view: ViewType;
  currentTask: Task;
  loadedTasks: Map<string, Task>;
  isSidecarReady: boolean;
}