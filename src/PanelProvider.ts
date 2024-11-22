import { v4 } from 'uuid';
import * as vscode from 'vscode';
import FileContextProvider from './context/providers/FileContextProvider';
import { IContextProvider } from './context/providers/types';
import { VSCodeIDE } from './ide';
import {
  ClientRequest,
  Preset,
  Task,
  ToolTypeType,
  View,
  PresetsLoaded,
  Response,
  ToolParameterType,
} from './model';
import { getNonce } from './webviews/utils/nonce';
import { ContextItemId, ContextItemWithId } from '.';
import { TerminalManager } from './terminal/TerminalManager';

const getDefaultTask = (activePreset: Preset) => ({
  query: '',
  sessionId: v4(),
  context: [],
  cost: 0,
  preset: activePreset,
  usage: {
    inputTokens: 0,
    outputTokens: 0,
    cacheReads: 0,
    cacheWrites: 0,
  },
  exchanges: [],
  responseOnGoing: false,
});


export type Terminal = vscode.Terminal & {
  busy: boolean;
  lastCommand: string;
  id: number;
}

export class PanelProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;
  private _runningTask: Task | undefined;
  private _taskTerminals: Terminal[] = [];
  // private _terminalsTimer: NodeJS.Timeout | undefined;
  private _presets: Map<string, Preset> = new Map();
  private _isSidecarReady: boolean = false;
  private readonly _extensionUri: vscode.Uri;
  private ide: VSCodeIDE;

  constructor(private readonly context: vscode.ExtensionContext, private readonly terminalManager: TerminalManager) {
    this._extensionUri = context.extensionUri;
    this.ide = new VSCodeIDE();

    // const goToHistory = vscode.commands.registerCommand('sota-swe.go-to-history', () => {
    //   if (this._view) {
    //     this._view.webview.postMessage({ type: 'open-view', view: View.History });
    //   }
    // });

    const openNewTask = vscode.commands.registerCommand('sota-swe.go-to-new-task', () => {
      if (this._view) {
        this.context.globalState.update('active-preset-id', undefined);

        const firstPreset = Array.from(this._presets.values()).at(0);
        let activePreset = firstPreset;

        if (activePreset) {
          this._runningTask = getDefaultTask(activePreset);
        }

        this._view.webview.postMessage({
          type: 'init-response',
          task: this._runningTask,
          isSidecarReady: this._isSidecarReady,
        });
      }
    });

    const goToSettings = vscode.commands.registerCommand('sota-swe.go-to-settings', () => {
      if (this._view) {
        this._view.webview.postMessage({ type: 'open-view', view: View.Settings });
      }
    });

    // load presets
    context.subscriptions.push(openNewTask, goToSettings);
    const presetsArray = (this.context.globalState.get('presets') as Preset[]) || [];
    presetsArray.forEach((preset) => {
      this._presets.set(preset.id, preset);
    });

    // Simple set interval for now
    setInterval(() => {
      if (this._view && this._runningTask) {

        const busyTerminalsMap = new Map(this.terminalManager.getTerminals(true).map(t => ([t.id, t])));
        const inactiveTerminals = new Map(this.terminalManager.getTerminals(false).map(t => ([t.id, t])));

        let terminals: Terminal[] = [];
        for (const [id, terminal] of vscode.window.terminals.entries()) {
          const busyTerminal = busyTerminalsMap.get(id);
          if (busyTerminal) {
            terminals.push({ ...terminal, ...busyTerminal, busy: true });
            continue;
          }
          const inactiveTerminal = inactiveTerminals.get(id);
          if (inactiveTerminal) {
            terminals.push({ ...terminal, ...inactiveTerminal, busy: false });
            continue;
          }
        }

        this._view.webview.postMessage({
          type: 'task-terminals',
          terminals
        });

      }
    }, 1000);
  }


  private _onMessageFromWebview = new vscode.EventEmitter<ClientRequest>();
  onMessageFromWebview = this._onMessageFromWebview.event;

  private _onDidWebviewBecomeVisible = new vscode.EventEmitter<void>();
  onDidWebviewBecomeVisible = this._onDidWebviewBecomeVisible.event;

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._runningTask = undefined;
    this._view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    this._onDidWebviewBecomeVisible.fire();
    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    const providers: IContextProvider[] = [new FileContextProvider({})];

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage(async (data: ClientRequest) => {
      this._onMessageFromWebview.fire(data);

      switch (data.type) {
        case 'init': {
          this.context.globalState.update('active-preset-id', undefined);

          const firstPreset = Array.from(this._presets.values()).at(0);
          let activePreset = firstPreset;

          if ((data.newSession || !this._runningTask) && activePreset) {
            this._runningTask = getDefaultTask(activePreset);
          }

          webviewView.webview.postMessage({
            type: 'init-response',
            task: this._runningTask,
            isSidecarReady: this._isSidecarReady,
          });
          break;
        }
        case 'get-presets': {
          const activePresetId = this.context.globalState.get<string>('active-preset-id');
          const presetTuples = Array.from(this._presets.entries());
          const firstPresetId = presetTuples.at(0)?.[0];
          const message: PresetsLoaded = {
            type: 'presets-loaded',
            presets: presetTuples,
            activePresetId: activePresetId || firstPresetId,
          };
          webviewView.webview.postMessage(message);
          break;
        }
        case 'add-preset': {
          const newPreset = {
            ...data.preset,
            type: 'preset',
            createdOn: new Date().toISOString(),
            id: v4(),
          } as Preset; // Why do we need casting?
          this._presets.set(newPreset.id, newPreset);
          this.context.globalState.update('presets', Array.from(this._presets.values()));
          this.context.globalState.update('active-preset-id', newPreset.id);
          break;
        }
        case 'update-preset': {
          if (this._presets.has(data.preset.id)) {
            const previousData = this._presets.get(data.preset.id);
            this._presets.set(data.preset.id, { ...previousData, ...data.preset });
            this.context.globalState.update('presets', Array.from(this._presets.values()));
          }
          break;
        }
        case 'delete-preset': {
          if (this._presets.has(data.presetId)) {
            this._presets.delete(data.presetId);
            this.context.globalState.update('presets', Array.from(this._presets.values()));
          }
          const activePresetId = this.context.globalState.get<string>('active-preset-id');
          if (activePresetId === data.presetId) {
            this.context.globalState.update('active-preset-id', undefined);
          }
          break;
        }
        case 'open-terminal': {
          const terminalId = data.id;
          console.log(terminalId);
          this._taskTerminals.find(t => t.id === terminalId)?.show();
          break;
        }
        case 'set-active-preset': {
          this.context.globalState.update('active-preset-id', data.presetId);
          break;
        }
        case 'context/fetchProviders': {
          webviewView.webview.postMessage({
            type: 'context/fetchProviders/response',
            providers: providers.map((provider) => provider.description),
            id: data.id,
          });
          break;
        }
        case 'context/loadSubmenuItems': {
          const items = await providers
            .find((provider) => provider.description.title === data.title)
            ?.loadSubmenuItems({
              ide: this.ide,
              fetch: (url, init) => fetch(url, init),
            });
          webviewView.webview.postMessage({
            type: 'context/loadSubmenuItems/response',
            items: items || [],
            id: data.id,
          });
          break;
        }
        case 'context/getContextItems': {
          const { name, query } = data;
          const provider = providers?.find((provider) => provider.description.title === name);
          if (!provider) {
            throw new Error(`Context provider '${name}' not found`);
          }

          try {
            const id: ContextItemId = {
              providerTitle: provider.description.title,
              itemId: v4(),
            };

            const items = await provider.getContextItems(query, { ide: this.ide });

            const response: ContextItemWithId[] = items.map((item) => ({
              ...item,
              id,
            }));

            webviewView.webview.postMessage({
              type: 'context/getContextItems/response',
              items: response,
              id: data.id,
            });
          } catch (e) {
            console.error(e);
            const response: ContextItemWithId[] = [];

            webviewView.webview.postMessage({
              type: 'context/getContextItems/response',
              items: response,
              id: data.id,
            });
          }
          break;
        }
      }
    });

    if (this._presets.size === 0) {
      // on initialisation we are able to pipe it
      this._view.webview.postMessage({
        command: 'initial-state',
        initialAppState: {
          extensionReady: false,
          view: View.Preset,
        },
      });
    } else {
      const firstPreset = Array.from(this._presets.values()).at(0);
      let activePreset = firstPreset;

      if (!this._runningTask && activePreset) {
        this._runningTask = getDefaultTask(activePreset);
      }

      this._view.webview.postMessage({
        command: 'initial-state',
        initialAppState: {
          extensionReady: false,
          activePreset,
          currentTask: this._runningTask,
        },
      });

      if (activePreset) {
        this._view.webview.postMessage({
          type: 'open-view',
          view: View.Task,
        });
      } else {
        this._view.webview.postMessage({
          type: 'open-view',
          view: View.Preset,
        });
      }
    }
  }

  public addToolTypeFound(sessionId: string, exchangeId: string, toolType: ToolTypeType) {
    if (this._runningTask && this._runningTask.sessionId === sessionId) {
      const exchangePossible = this._runningTask.exchanges.find((exchange) => {
        return exchange.exchangeId === exchangeId;
      }) as Response | undefined;
      if (exchangePossible) {
        exchangePossible.parts.push({
          type: 'toolType',
          toolType,
        });
      }

      // we update our webview with the latest state
      this._view?.webview.postMessage({
        command: 'state-updated',
        initialAppState: {
          extensionReady: false,
          view: View.Task,
          currentTask: this._runningTask,
          loadedTasks: new Map(),
        },
      });
    }
  }

  public addToolParameterFound(
    sessionId: string,
    exchangeId: string,
    fieldName: ToolParameterType,
    fieldContentDelta: string,
    fieldContentUpUntilNow: string
  ) {
    if (this._runningTask && this._runningTask.sessionId === sessionId) {
      const exchangePossible = this._runningTask.exchanges.find((exchange) => {
        return exchange.exchangeId === exchangeId;
      }) as Response | undefined;
      if (exchangePossible) {
        const index = exchangePossible.parts.findIndex((part) => {
          return part.type === 'toolParameter' && part.toolParameters.parameterName === fieldName;
        });
        if (index !== -1) {
          if (exchangePossible.parts[index].type === 'toolParameter') {
            exchangePossible.parts[index].toolParameters.contentUpUntilNow = fieldContentUpUntilNow;
          }
        } else {
          exchangePossible.parts.push({
            type: 'toolParameter',
            toolParameters: {
              contentDelta: fieldContentDelta,
              contentUpUntilNow: fieldContentUpUntilNow,
              parameterName: fieldName,
            },
          });
        }
      }

      // we update our webview with the latest state
      this._view?.webview.postMessage({
        command: 'state-updated',
        initialAppState: {
          extensionReady: false,
          view: View.Task,
          currentTask: this._runningTask,
          loadedTasks: new Map(),
        },
      });
    }
  }

  public addToolThinking(sessionId: string, exchangeId: string, thinking: string | null) {
    if (this._runningTask && this._runningTask.sessionId === sessionId) {
      const exchangePossible = this._runningTask.exchanges.find((exchange) => {
        return exchange.exchangeId === exchangeId;
      }) as Response | undefined;

      if (exchangePossible) {
        const index = exchangePossible.parts.findIndex((part) => {
          return part.type === 'toolThinking';
        });
        if (index !== -1) {
          if (exchangePossible.parts[index].type === 'toolThinking' && thinking) {
            exchangePossible.parts[index].markdown = {
              type: 'markdown',
              rawMarkdown: thinking,
            };
          }
        } else {
          if (thinking) {
            exchangePossible.parts.push({
              type: 'toolThinking',
              markdown: {
                type: 'markdown',
                rawMarkdown: thinking,
              },
            });
          }
        }
      }

      // we update our webview with the latest state
      this._view?.webview.postMessage({
        command: 'state-updated',
        initialAppState: {
          extensionReady: false,
          view: View.Task,
          currentTask: this._runningTask,
          loadedTasks: new Map(),
        },
      });
    }
  }

  public addChatMessage(sessionId: string, exchangeId: string, delta: string | null) {
    if (this._runningTask && this._runningTask.sessionId === sessionId) {
      const exchangePossible = this._runningTask.exchanges.find((exchange) => {
        return exchange.exchangeId === exchangeId;
      }) as Response | undefined;
      if (exchangePossible && delta) {
        exchangePossible.parts.push({
          type: 'markdown',
          rawMarkdown: delta,
        });
      }

      // we update our webview with the latest state
      this._view?.webview.postMessage({
        command: 'state-updated',
        initialAppState: {
          extensionReady: false,
          view: View.Task,
          currentTask: this._runningTask,
          loadedTasks: new Map(),
        },
      });
    }
  }

  /**
   * Returns if the exchange exists on the session
   */
  public doesExchangeExist(sessionId: string, exchangeId: string): boolean {
    if (this._runningTask && this._runningTask.sessionId === sessionId) {
      if (
        this._runningTask.exchanges.find((exchange) => {
          return exchange.exchangeId === exchangeId;
        })
      ) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  public createNewExchangeResponse(sessionId: string): string | undefined {
    if (this._runningTask && this._runningTask.sessionId === sessionId) {
      const exchangeId = v4();
      this._runningTask.exchanges.push({
        type: 'response',
        parts: [],
        exchangeId,
        username: 'testing',
        context: [],
        sessionId,
      });

      this._view?.webview.postMessage({
        command: 'state-updated',
        initialAppState: {
          extensionReady: false,
          view: View.Task,
          currentTask: this._runningTask,
          loadedTasks: new Map(),
        },
      });
      return exchangeId;
    }
    return undefined;
  }

  public addExchangeRequest(sessionId: string, exchangeId: string, request: string) {
    if (this._runningTask) {
      if (this._runningTask.query !== '') {
        this._runningTask.query = request;
      }
      this._runningTask.exchanges.push({
        type: 'request',
        message: request,
        exchangeId,
        sessionId,
        context: [],
        username: 'testing',
      });

      this._view?.webview.postMessage({
        command: 'state-updated',
        initialAppState: {
          extensionReady: false,
          view: View.Task,
          currentTask: this._runningTask,
          loadedTasks: new Map(),
        },
      });
    }
  }

  // informs webview of status updates
  public updateState() {
    if (!this._view) {
      return;
    }

    const sidecarReadyState = {
      type: 'sidecar-ready-state',
      isSidecarReady: this._isSidecarReady,
    };

    // tell the webview that the sidecar is ready
    this._view.webview.postMessage(sidecarReadyState);
  }

  // updates internal state and tells the webview
  public setSidecarReady(ready: boolean) {
    this._isSidecarReady = ready;
    this.updateState();
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'dist', 'index.js')
    );

    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'dist', 'style.css')
    );

    const codiconsUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        'node_modules',
        '@vscode/codicons',
        'dist',
        'codicon.css'
      )
    );

    const nonce = getNonce();

    return `<!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta http-equiv="Content-Security-Policy" content="default-src 'self' ${webview.cspSource}; style-src 'unsafe-inline' 'self' ${webview.cspSource}; script-src 'nonce-${nonce}' 'wasm-unsafe-eval'; wasm-unsafe-eval 'self'">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Example View</title>
              <link rel="stylesheet" href="${codiconsUri}">
              <link rel="stylesheet" href="${styleUri}">
          </head>
          <body>
            <div id="root"></div>
            <script nonce="${nonce}">
                const vscode = acquireVsCodeApi();
                window.onload = function() {
                  console.log('HTML started up.');
                };
            </script>
            <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
          </body>
    </html>`;
  }
}
