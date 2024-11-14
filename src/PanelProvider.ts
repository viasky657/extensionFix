import * as vscode from "vscode";
import { ClientRequest } from "./model";
import { getNonce } from "./webviews/utils/nonce";

export class PanelProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;
  private _isSidecarReady: boolean = false;

  constructor(private readonly _extensionUri: vscode.Uri) { }

  private _onMessageFromWebview = new vscode.EventEmitter<ClientRequest>();
  onMessageFromWebview = this._onMessageFromWebview.event;

  private _onDidWebviewBecomeVisible = new vscode.EventEmitter<void>();
  onDidWebviewBecomeVisible = this._onDidWebviewBecomeVisible.event;

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
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
          webviewView.webview.postMessage({ command: "init" });
          break;
      }
    });
  }

  // informs webview of status updates
  public updateState() {
    if (!this._view) {
      return;
    }

    // tell the webview that the sidecar is ready
    this._view.webview.postMessage({
      command: 'updateState',
      isSidecarReady: this._isSidecarReady
    });
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
                  vscode.postMessage({ type: 'init' });
                  console.log('HTML started up.');
                };
            </script>
            <script nonce="${nonce}" src="${scriptUri}"></script>
          </body>
    </html>`;
  }
}
