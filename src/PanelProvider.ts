import * as vscode from "vscode";
import { ClientRequest, Task, ToolThinkingToolTypeEnum, View } from "./model";
import { Response, } from "./model";
import { getNonce } from "./webviews/utils/nonce";
import { v4 } from 'uuid';

export class PanelProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;
  private _isSidecarReady: boolean = false;

  constructor(private readonly _extensionUri: vscode.Uri) { }

  private _onMessageFromWebview = new vscode.EventEmitter<ClientRequest>();
  onMessageFromWebview = this._onMessageFromWebview.event;

  private _onDidWebviewBecomeVisible = new vscode.EventEmitter<void>();
  onDidWebviewBecomeVisible = this._onDidWebviewBecomeVisible.event;
  private _runningTask: Task | undefined;

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

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage((data) => {
      this._onMessageFromWebview.fire(data);
      switch (data.type) {
        case "init":
          webviewView.webview.postMessage({ type: "init-response", task: this._runningTask, view: View.Task, isSidecarReady: this._isSidecarReady });
          break;
      }
    });

    this._runningTask = {
      sessionId: v4(),
      context: [],
      cost: 0,
      usage: {
        inputTokens: 0,
        outputTokens: 0,
        cacheReads: 0,
        cacheWrites: 0,
      },
      exchanges: [],
      preset: {
        provider: "anthropic",
        model: "claude-3-5-sonnet-20241022",
        apiKey: "exampleApiKey123",
        customBaseUrl: "https://api.anthropic.com",
        permissions: {
          readData: "ask",
          writeData: "ask",
        },
        customInstructions: "Answer as concisely as possible",
        name: "claude-sonnet-3.5",
      },
      responseOnGoing: false,
    };

    // on initialisation we are able to pipe it
    this._view.webview.postMessage({
      command: 'initial-state',
      initialAppState: {
        extensionReady: false,
        view: View.Task,
        currentTask: this._runningTask,
        loadedTasks: new Map()
      }
    });
  }

  public addToolTypeFound(sessionId: string, exchangeId: string, toolType: ToolThinkingToolTypeEnum) {
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
          loadedTasks: new Map()
        }
      });
    }
  }

  public addToolParameterFound(sessionId: string, exchangeId: string, fieldName: string, fieldContentDelta: string, fieldContentUpUntilNow: string) {
    if (this._runningTask && this._runningTask.sessionId === sessionId) {
      const exchangePossible = this._runningTask.exchanges.find((exchange) => {
        return exchange.exchangeId === exchangeId;
      }) as Response | undefined;
      if (exchangePossible) {
        const index = exchangePossible.parts.findIndex((part) => {
          return (part.type === 'toolParameter' && part.toolParameters.parameterName === fieldName);
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
            }
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
          loadedTasks: new Map()
        }
      });
    }
  }

  public addToolThinking(sessionId: string, exchangeId: string, thinking: string | null) {
    if (this._runningTask && this._runningTask.sessionId === sessionId) {
      const exchangePossible = this._runningTask.exchanges.find((exchange) => {
        return exchange.exchangeId === exchangeId;
      }) as Response | undefined;
      if (exchangePossible && thinking) {
        exchangePossible.parts.push({
          type: 'toolThinking',
          markdown: {
            type: "markdown",
            rawMarkdown: thinking,
          }
        });
      }

      // we update our webview with the latest state
      this._view?.webview.postMessage({
        command: 'state-updated',
        initialAppState: {
          extensionReady: false,
          view: View.Task,
          currentTask: this._runningTask,
          loadedTasks: new Map()
        }
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
          type: "markdown",
          rawMarkdown: delta
        });
      }

      // we update our webview with the latest state
      this._view?.webview.postMessage({
        command: 'state-updated',
        initialAppState: {
          extensionReady: false,
          view: View.Task,
          currentTask: this._runningTask,
          loadedTasks: new Map()
        }
      });
    }
  }

  /**
   * Returns if the exchange exists on the session
   */
  public doesExchangeExist(sessionId: string, exchangeId: string): boolean {
    if (this._runningTask && this._runningTask.sessionId === sessionId) {
      if (this._runningTask.exchanges.find((exchange) => {
        return exchange.exchangeId === exchangeId;
      })) {
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
        type: "response",
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
          loadedTasks: new Map()
        }
      });
      return exchangeId;
    }
    return undefined;
  }

  public addExchangeRequest(sessionId: string, exchangeId: string, request: string) {
    if (this._runningTask) {
      this._runningTask.exchanges.push({
        type: "request",
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
          loadedTasks: new Map()
        }
      });
    }
  }

  // informs webview of status updates
  public updateState() {
    if (!this._view) {
      return;
    }

    const sidecarReadyState = {
      type: "sidecar-ready-state",
      isSidecarReady: this._isSidecarReady
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
      vscode.Uri.joinPath(this._extensionUri, "dist", "index.js")
    );

    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "dist", "style.css")
    );

    const codiconsUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        "node_modules",
        "@vscode/codicons",
        "dist",
        "codicon.css"
      )
    );

    const nonce = getNonce();

    return `<!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
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
            <script nonce="${nonce}" src="${scriptUri}"></script>
          </body>
    </html>`;
  }
}
