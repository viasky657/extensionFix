// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { PanelProvider } from "./PanelProvider";
import { SideCarClient } from "./sidecar/client";
import { startSidecarBinary } from "./utilities/setupSidecarBinary";

export let SIDECAR_CLIENT: SideCarClient | null = null;

/**
Extension → PanelProvider → Webview (app.tsx)
(native)     (bridge)       (UI layer)

Example flow:
1. Extension starts sidecar download
2. When ready, calls panelProvider.setSidecarReady()
3. PanelProvider sends message to webview
4. app.tsx receives message and updates UI
 */

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
  const panelProvider = new PanelProvider(context.extensionUri);

  // Show the panel immediately
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("sota-pr-panel", panelProvider)
  );

  // sidecar binary download in background
  startSidecarBinary(context.globalStorageUri.fsPath).then(async (sidecarUrl) => {
    console.log("sidecarUrl", sidecarUrl);
    const sidecarClient = new SideCarClient(sidecarUrl);

    const healthCheck = await sidecarClient.healthCheck();
    console.log("Sidecar health check", healthCheck);

    // Tell the PanelProvider that the sidecar is ready
    panelProvider.setSidecarReady(true);
    SIDECAR_CLIENT = sidecarClient;
  }).catch(error => {
    console.error("Failed to start sidecar:", error);
    vscode.window.showErrorMessage("Failed to start Sota PR Assistant sidecar");
  });

  context.subscriptions.push(
    panelProvider.onMessageFromWebview((message) => {
      if (message.type === "new-request") {
        console.log(message.query);
        // @theskcd we will ping sindecar here
      }
    })
  );

  context.subscriptions.push(
    panelProvider.onDidWebviewBecomeVisible(() => {
      // @theskcd we update the view state here
      panelProvider.updateState();
    })
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const command = vscode.commands.registerCommand(
    "extension.helloWorld",
    () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      vscode.window.showInformationMessage("Hello World from extension!");
    }
  );

  context.subscriptions.push(command);
}

// This method is called when your extension is deactivated
export function deactivate() { }
