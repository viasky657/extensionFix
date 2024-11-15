// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { PanelProvider } from "./PanelProvider";
import { RepoRef, RepoRefBackend, SideCarClient } from "./sidecar/client";
import { startSidecarBinary } from "./utilities/setupSidecarBinary";
import { ProjectContext } from "./utilities/workspaceContext";
import { RecentEditsRetriever } from "./server/editedFiles";
import { AideAgentSessionProvider } from "./completions/providers/aideAgentProvider";
import { uniqueId } from "lodash";
import { AideAgentMode } from "./types";
import { TerminalManager } from "./terminal/TerminalManager";
// import { AideAgentSessionProvider } from "./completions/providers/aideAgentProvider";
// import { ProjectContext } from "./utilities/workspaceContext";
// import { RecentEditsRetriever } from "./server/editedFiles";

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
  let rootPath = vscode.workspace.rootPath;
  if (!rootPath) {
    rootPath = "";
  }

  const currentRepo = new RepoRef(
    // We assume the root-path is the one we are interested in
    rootPath,
    RepoRefBackend.local
  );

  // We also get some context about the workspace we are in and what we are
  // upto
  const projectContext = new ProjectContext();
  await projectContext.collectContext();

  // add the recent edits retriver to the subscriptions
  // so we can grab the recent edits very quickly
  const recentEditsRetriever = new RecentEditsRetriever(
    300 * 1000,
    vscode.workspace
  );
  context.subscriptions.push(recentEditsRetriever);

  // Create a terminal manager instance
  const terminalManager = new TerminalManager();

  // Register the agent session provider
  const agentSessionProvider = new AideAgentSessionProvider(
    currentRepo,
    projectContext,
    recentEditsRetriever,
    context,
    panelProvider,
    terminalManager,
  );
  context.subscriptions.push(agentSessionProvider);

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
    panelProvider.onMessageFromWebview(async (message) => {
      if (message.type === 'task-feedback') {
        // here we get the message from the user
        const query = message.query;
        const sessionId = message.sessionId;

        // something will create the exchange id
        const exchangeId = uniqueId();
        panelProvider.addExchangeRequest(sessionId, exchangeId, query);

        // - ping the sidecar over here. currentRepo can be undefined, which will 422 sidecar
        const stream = SIDECAR_CLIENT!.agentSessionPlanStep(
          query,
          sessionId,
          exchangeId,
          agentSessionProvider.editorUrl!,
          AideAgentMode.Chat,
          [],
          currentRepo ?? "",
          projectContext.labels,
          false,
          'workos-fake-id',
        );
        // - have a respose somewhere and the chat model would update
        agentSessionProvider.reportAgentEventsToChat(true, stream);
        // and the model will have a on did change
        // - the extension needs the state
        // - on did change chat model gets back over here
      }

      if (message.type === 'open-file') {
        try {
          const uri = vscode.Uri.parse(message.fs_file_path);
          const document = await vscode.workspace.openTextDocument(uri);
          await vscode.window.showTextDocument(document);
          console.log('file opened');
        } catch (err) {
          console.error(`Could not find file with path ${message.fs_file_path}`);
        }
      }
    })
  );

  context.subscriptions.push(
    panelProvider.onDidWebviewBecomeVisible(() => {
      // @theskcd we update the view state here
      panelProvider.updateState();
    })
  );
}

// This method is called when your extension is deactivated
export function deactivate() { }
