import { MarkdownString } from "vscode";

type ResponseParts = MarkdownString

interface MessageBase {
  exchangeId: string,
  sessionId: string,
}

export interface Response extends MessageBase {
  type: 'response',
  parts: ResponseParts[],
}

export interface Request extends MessageBase {
  type: 'request',
  message: string
}

export type Exchange = Request | Response


// Should be moved somewhere else


enum Provider {
  Anthropic,
  OpenAI,
  OpenRouter,
  GoogleGemini,
  AWSBedrock,
  OpenAICompatible,
  Ollama
}

type AnthropicModels = 'claude-3-5-sonnet-20241022'
  | 'claude-3-5-haiku-20241022'
  | 'claude-3-opus-20241022'
  | 'claude-3-haiku-20241022'

type Model = AnthropicModels

enum PermissionState {
  Always,
  Ask,
  Never
}

type PermissionStateType = `${PermissionState}`

type Permissions = Record<string, PermissionStateType>

type ProviderType = `${Provider}`

interface Preset {
  provider: ProviderType,
  model: Model,
  apiKey: string,
  customBaseUrl?: string,
  permissions: Permissions,
  customInstructions: string,
  name: string,
}
