import { ChatPromptReference, Uri, ChatRequest, WorkspaceEdit, MarkdownString, Command, ChatResponseStream, CancellationToken, ProviderResult, ChatResult, ChatParticipant, Range } from "vscode";
import { Provider } from "./model";

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export type HealthStatus = 'OK' | 'UNAVAILABLE';
export type HealthState = {
	status: HealthStatus;
};


export type SearchState = {
	prompt: string;
};


export type OpenFileState = {
	filePath: string;
	lineStart: number;
};

export type CheckpointState = {
	timestamp: Date;
};

export type DocumentsState = Record<string, string>;

export type ChangesState = {
	changes: string;
};

export type GitCommitRequest = {
	files: string[];
	message: string;
};

export type PromptState = {
	prompt: string;
};



export enum AideAgentMode {
	Edit = 1,
	Plan = 2,
	Chat = 3
}

export enum AideAgentScope {
	Selection = 1,
	PinnedContext = 2,
	Codebase = 3
}

export enum AideAgentPlanState {
	Started = 'Started',
	Complete = 'Complete',
	Cancelled = 'Cancelled',
	Accepted = 'Accepted',
}

export type AideAgentPlanStateType = `${AideAgentPlanState}`;

export enum AideAgentEditsState {
	Loading = 'loading',
	MarkedComplete = 'markedComplete',
	Cancelled = 'cancelled',
}

export type AideAgentEditsStateType = `${AideAgentEditsState}`;

export enum AideAgentStreamingStateEnum {
	Loading = 'loading',
	WaitingFeedback = 'waitingFeedback',
	// We can show if the edits have started using this
	EditsStarted = 'editsStarted',
	Finished = 'finished',
	// NOTE: This is a dynamic properly, ideally we should be using either of
	// finished or waitingFeedback, but since that part is not built yet
	// we will derive our state from the Cancelled
	// Cancelled can go to Finished | WaitingFeedback
	Cancelled = 'cancelled',
}

export type AideAgentStreamingStateType = `${AideAgentStreamingStateEnum}`;

export enum AideAgentStreamingStateLoadingLabel {
	UnderstandingRequest = 'understandingRequest',
	ExploringCodebase = 'exploringCodebase',
	Reasoning = 'reasoning',
	Generating = 'generating',
}

export type AideAgentStreamingStateLoadingLabelType = `${AideAgentStreamingStateLoadingLabel}`;

export interface AideAgentFileReference extends ChatPromptReference {
	readonly id: 'vscode.file';
	readonly value: {
		uri: Uri;
		range: Range;
	};
}

export interface AideAgentCodeReference extends ChatPromptReference {
	readonly id: 'vscode.code';
	readonly value: {
		uri: Uri;
		range: Range;
	};
}

// This is a cool looking type, but TypeScript currently doesn't enforce it. But it helps understand
// the intent for us to use it correctly.
export type AideAgentPromptReference =
	| AideAgentFileReference
	| AideAgentCodeReference
	| (Omit<ChatPromptReference, 'id'> & { id: Exclude<string, 'vscode.file'> });

export interface AideAgentRequest extends ChatRequest {
	// is this the exchange id, if so it should explicity be named that instead of id :|
	readonly exchangeId: string;
	readonly sessionId: string;
	readonly mode: AideAgentMode;
	readonly scope: AideAgentScope;
	readonly references: readonly AideAgentPromptReference[];
}

export enum AideButtonLook {
	Primary = 'primary',
	Secondary = 'secondary'
}

export interface AideChatStep {
	/**
	 * The index of the step in the plan
	 */
	readonly index: number;
	/**
	 * Wether it's the last step in the plan
	 */
	readonly isLast: boolean;
	/*
	 * Description of the edits
	 */
	readonly description: string | MarkdownString;
	/*
	 * The session id of the plan
	 */
	readonly sessionId: string;
	/**
	 * The exchange id of the plan (since we can revert and generate the plan a new
	 * the exchange id might be tied to a previous plan)
	 */
	readonly exchangeId: string;

	/**
	 * The title of the step in the plan
	 */
	readonly title: string;
	/**
	 * Progressive update on the description over here
	 */
	readonly descriptionDelta: string | MarkdownString | null;
	/**
	 * The files which are part of the step
	 */
	readonly files: Uri[];
}


export interface AideAgentPlanInfo {
	/*
	 * State of the plans
	 */
	readonly state: AideAgentPlanStateType;
	/*
	 * Wether the plans are stale
	 */
	readonly isStale: boolean;
	/*
	 * Description of the plans
	 */
	readonly description?: string | MarkdownString;
	/*
	 * The session id of the plan
	 */
	readonly sessionId: string;
	/*
	 * The session id of the plan
	 */
	readonly exchangeId: string;
}

export interface AideAgentThinkingForEdit {
	readonly exchangeId: string;
	readonly sessionId: string;
	readonly thinkingDelta: string;
}

export interface AideAgentPlanRegenerateInformation {
	readonly sessionId: string;
	readonly exchangeId: string;
}

export interface AideAgentEditsInfo {
	/*
	 * State of the edits
	 */
	readonly state: AideAgentEditsStateType;
	/*
	 * Wether the edits are stale
	 */
	readonly isStale: boolean;
	/*
	 * Files affected by the change
	 */
	readonly files: Uri[];
	/*
	 * Description of the edits
	 */
	readonly description?: string | MarkdownString;
	/*
	 * The session id of the plan
	 */
	readonly sessionId: string;
	/*
	 * The session id of the plan
	 */
	readonly exchangeId: string;
}


export interface AideRollbackCompleted {
	/*
 * The session id of the plan
 */
	readonly sessionId: string;
	/*
	 * The session id of the plan
	 */
	readonly exchangeId: string;
	/*
	 * The number of edits added
	 */
	readonly exchangesRemoved: number;
}

export interface AideCommand {
	/**
	 * VSCode command to execute
	 */
	readonly command: Command;
	/**
	 * Visual options for the button
	 */
	readonly buttonOptions?: {
		title?: string;
		look?: `${AideButtonLook}`;
		codiconId?: string;
	};
}

export interface AideAgentStreamingState {
	state: `${AideAgentStreamingStateEnum}`;
	loadingLabel?: `${AideAgentStreamingStateLoadingLabel}`;
	exchangeId: string;
	// the files which are part of the streaming state
	// what we really want is to tie this state to the edits started
	// state, but .... 🫡 (I am lazy)
	files: string[];
	sessionId: string;
	isError: boolean;
	message?: string;
}

export interface AideAgentResponseStream extends Omit<ChatResponseStream, 'button'> {
	editsInfo(edits: AideAgentEditsInfo): void;
	planInfo(plan: AideAgentPlanInfo): void;
	button(command: AideCommand): void;
	buttonGroup(commands: AideCommand[]): void;
	streamingState(state: AideAgentStreamingState): void;
	codeEdit(edits: WorkspaceEdit): void;
	step(step: AideChatStep): void;
	thinkingForEdit(part: AideAgentThinkingForEdit): void;
	regeneratePlan(planInformation: AideAgentPlanRegenerateInformation): void;
	close(): void;
}

export interface AideAgentEventSenderResponse {
	stream: AideAgentResponseStream;
	exchangeId: string;
	token: CancellationToken;
}

export enum AideSessionExchangeUserAction {
	AcceptAll = 1,
	RejectAll = 2,
}

export type AideSessionHandler = (id: string) => void;
export type AideSessionHandleUserAction = (sessionId: string, exchangeId: string, stepIndex: number | undefined, action: AideSessionExchangeUserAction) => void;
export type AideSessionUndoAction = (sessionId: string, exchangeId: string) => void;
export type AideSessionIterationRequest = (sessionId: string, exchangeId: string, iterationQuery: string, references: readonly AideAgentPromptReference[]) => void;
export type AideSessionEventHandler = (event: AideAgentRequest, token: CancellationToken) => ProviderResult<ChatResult | void>;
export type AideSessionEventSender = (sessionId: string) => Thenable<AideAgentEventSenderResponse | undefined>;

export interface AideSessionParticipant {
	newSession: AideSessionHandler;
	handleEvent: AideSessionEventHandler;
	// Used to handle the exchange which the user has taken on a chat exchange
	// NOTE: This might not be correct, but we are in a time-crunch and this will work, refrain from doing
	// changes until necessary
	handleExchangeUserAction: AideSessionHandleUserAction;
	handleSessionUndo: AideSessionUndoAction;
	handleSessionIterationRequest: AideSessionIterationRequest;
}

export interface AideSessionAgent extends Omit<ChatParticipant, 'requestHandler'> {
	requestHandler: AideSessionEventHandler;
	readonly initResponse: AideSessionEventSender;
}


declare module 'vscode' {

	export class ChatResponseCodeEditPart {
		edits: WorkspaceEdit;
		constructor(edits: WorkspaceEdit);
	}

	export type AideAgentResponsePart = ChatResponseCodeEditPart;

	export namespace aideAgent {
		export function createChatParticipant(id: string, resolver: AideSessionParticipant): AideSessionAgent;
	}

	export namespace languages {
		export function getCodeLensProvider(document: DocumentSelector): ProviderResult<CodeLensProvider>;
		export function getInlayHintsProvider(document: DocumentSelector): ProviderResult<InlayHintsProvider>;
	}

	interface AuthenticatedCSUser {
		email: string;
	}

	export interface CSAuthenticationSession {
		/**
		 * The access token.
		 */
		readonly accessToken: string;

		/**
		 * The authenticated user.
		 */
		readonly account: AuthenticatedCSUser;
	}

	export namespace csAuthentication {
		export function getSession(): Thenable<CSAuthenticationSession | undefined>;
	}

	export enum SymbolNavigationActionType {
		GoToDefinition = 0,
		GoToDeclaration = 1,
		GoToTypeDefinition = 2,
		GoToImplementation = 3,
		GoToReferences = 4,
		GenericGoToLocation = 5
	}

	export interface SymbolNavigationEvent {
		position: Position;
		action: SymbolNavigationActionType;
		uri: Uri;
	}

	export interface CSEventHandler {
		handleSymbolNavigation(event: SymbolNavigationEvent): void;
		handleAgentCodeEdit(event: { accepted: boolean; added: number; removed: number }): void;
	}

	export namespace csevents {
		export function registerCSEventHandler(handler: CSEventHandler): Disposable;
	}

	export interface ModelSelection {
		slowModel: string;
		fastModel: string;
		models: LanguageModels;
		providers: ModelProviders;
	}

	export interface ProviderSpecificConfiguration {
		type: string;
		deploymentID?: string;
	}

	export interface LanguageModelConfiguration {
		name: string;
		contextLength: number;
		temperature: number;
		provider: ProviderSpecificConfiguration;
	}

	export interface ModelProviderConfiguration {
		name: string;
		apiBase?: string | null;
		apiKey?: string | null;
	}

	export type LanguageModels = Record<string, LanguageModelConfiguration>;
	export type ModelProviders = Partial<Record<Provider, ModelProviderConfiguration>>;


	export namespace modelSelection {
		export function getConfiguration(): Thenable<ModelSelection>;
		export const onDidChangeConfiguration: Event<ModelSelection>;
	}
}