import { ContextItemWithId, RangeInFile } from '.';

export enum View {
  Task = 'task',
  Preset = 'preset',
  Welcome = 'welcome',
  Settings = 'settings',
  History = 'history',
}

export type ViewType = `${View}`;

interface TaskFeedback {
  type: 'task-feedback';
  query: string;
  sessionId: string;
  variables: ContextItemWithId[];
}

interface InitRequest {
  type: 'init';
}

interface OpenFile {
  type: 'open-file';
  fs_file_path: string;
}

interface GetPresets {
  type: 'get-presets';
}

interface AddPreset {
  type: 'add-preset';
  preset: NewPreset;
}

interface UpdatePreset {
  type: 'update-preset';
  preset: Preset;
}

interface SetActivePreset {
  type: 'set-active-preset';
  presetId: string;
}

interface DeletePreset {
  type: 'delete-preset';
  presetId: string;
}

interface FetchContextProviders {
  type: 'context/fetchProviders';
  id: string;
}

interface LoadSubmenuItems {
  type: 'context/loadSubmenuItems';
  id: string;
  title: string;
}

interface GetContextItems {
  type: 'context/getContextItems';
  id: string;
  name: string;
  query: string;
  fullInput: string;
  selectedCode: RangeInFile[];
}

export type ClientRequest =
  | TaskFeedback
  | SetActivePreset
  | DeletePreset
  | OpenFile
  | InitRequest
  | GetPresets
  | AddPreset
  | UpdatePreset
  | FetchContextProviders
  | LoadSubmenuItems
  | GetContextItems;

export interface PresetsLoaded {
  type: 'presets-loaded';
  presets: [string, Preset][];
  activePresetId?: string;
}

interface OpenTaskEvent {
  type: 'open-task';
  task: Task;
}

interface TaskResponseEvent {
  type: 'task-response';
  response: Response;
}

interface InitResponse {
  type: 'init-response';
  task: Task;
  isSidecarReady: boolean;
}

interface InitialState {
  type: 'initial-state';
  initialAppState: AppState;
}

interface TaskUpdate {
  type: 'task-update';
  currentTask: Task;
}

interface SidecarReadyState {
  type: 'sidecar-ready-state';
  isSidecarReady: boolean;
}

interface OpenView {
  type: 'open-view';
  view: ViewType;
}

export type Event =
  | OpenView
  | PresetsLoaded
  | OpenTaskEvent
  | TaskResponseEvent
  | InitResponse
  | InitialState
  | TaskUpdate
  | SidecarReadyState;

export type NewSessionRequest = {
  type: 'new-request';
  query: string;
  exchangeId: string;
};

export type MarkdownResponsePart = {
  type: 'markdown';
  rawMarkdown: string;
};

export type Command = {
  command: string;
  title: string;
};

export type CommandGroupResponsePart = {
  type: 'commandGroup';
  commands: Command[];
};

export type ToolThinkingResponsePart = {
  type: 'toolThinking';
  // this is the full tool thinking always
  markdown: MarkdownResponsePart;
};

export type ToolParameterResponsePart = {
  type: 'toolParameter';
  toolParameters: {
    parameterName: string;
    contentDelta: string;
    contentUpUntilNow: string;
  };
};

export type ToolThinkingToolTypeEnum =
  | 'ListFiles'
  | 'SearchFileContentWithRegex'
  | 'OpenFile'
  | 'CodeEditing'
  | 'LSPDiagnostics'
  | 'AskFollowupQuestions'
  | 'AttemptCompletion'
  | 'RepoMapGeneration';

export type ToolThinkingToolTypeResponsePart = {
  type: 'toolType';
  toolType: ToolThinkingToolTypeEnum;
};

export type ResponsePart =
  | MarkdownResponsePart
  | CommandGroupResponsePart
  | ToolThinkingResponsePart
  | ToolThinkingToolTypeResponsePart
  | ToolParameterResponsePart;

interface MessageBase {
  username: string;
  exchangeId: string;
  sessionId: string;
  context: string[];
}

export interface Response extends MessageBase {
  type: 'response';
  parts: ResponsePart[];
}

export interface Request extends MessageBase {
  type: 'request';
  message: string;
}

export interface Usage {
  inputTokens: number;
  outputTokens: number;
  cacheReads: number;
  cacheWrites: number;
}

export interface Task {
  query: string;
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
  Anthropic = 'anthropic',
  OpenAI = 'open-ai',
  OpenRouter = 'open-router',
  GoogleGemini = 'google-geminbi',
  AWSBedrock = 'aws-bedrock',
  OpenAICompatible = 'open-ai-compatible',
  Ollama = 'ollama',
}

export enum PermissionState {
  Always = 'always',
  Ask = 'ask',
  // Never = "never",
}

type PermissionStateType = `${PermissionState}`;

type Permissions = {
  codeEditing: PermissionStateType;
  listFiles: PermissionStateType;
  terminalCommands: PermissionStateType;
};

export type ProviderType = `${Provider}`;

type BasePreset = {
  provider: ProviderType;
  model: string;
  apiKey: string;
  customBaseUrl?: string;
  permissions: Permissions;
  customInstructions: string;
  name: string;
};

export type Preset = BasePreset & {
  type: 'preset';
  id: string;
  createdOn: string;
};

export type NewPreset = BasePreset & {
  type: 'new-preset';
};

export interface AppState {
  extensionReady: boolean;
  isSidecarReady: boolean;
  currentTask?: Task;
  activePreset?: Preset;
}
