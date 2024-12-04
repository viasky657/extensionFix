import { FileType, IDE } from '.';
import * as vscode from 'vscode';
import { uriFromFilePath, VSCodeIDEUtils } from './ideUtils';

export class VSCodeIDE implements IDE {
  private static MAX_BYTES = 100000;

  ideUtils: VSCodeIDEUtils;

  constructor() {
    this.ideUtils = new VSCodeIDEUtils();
  }

  getWorkspaceDirs(): Promise<string[]> {
    return Promise.resolve(this.ideUtils.getWorkspaceDirectories());
  }

  listDir(dir: string): Promise<[string, FileType][]> {
    return vscode.workspace.fs.readDirectory(uriFromFilePath(dir)) as any;
  }

  pathSep(): Promise<string> {
    return Promise.resolve(this.ideUtils.path.sep);
  }

  async readFile(filepath: string): Promise<string> {
    try {
      filepath = this.ideUtils.getAbsolutePath(filepath);
      const uri = uriFromFilePath(filepath);

      // Check whether it's an open document
      const openTextDocument = vscode.workspace.textDocuments.find(
        (doc) => doc.uri.fsPath === uri.fsPath
      );
      if (openTextDocument !== undefined) {
        return openTextDocument.getText();
      }

      const fileStats = await vscode.workspace.fs.stat(uriFromFilePath(filepath));
      if (fileStats.size > 10 * VSCodeIDE.MAX_BYTES) {
        return '';
      }

      const bytes = await vscode.workspace.fs.readFile(uri);

      // Truncate the buffer to the first MAX_BYTES
      const truncatedBytes = bytes.slice(0, VSCodeIDE.MAX_BYTES);
      const contents = new TextDecoder().decode(truncatedBytes);
      return contents;
    } catch (e) {
      console.warn('Error reading file', e);
      return '';
    }
  }

  showToast(level: 'info' | 'warning' | 'error', message: string) {
    switch (level) {
      case 'error': {
        return vscode.window.showErrorMessage(message);
      }
      case 'info': {
        return vscode.window.showInformationMessage(message);
      }
      case 'warning': {
        return vscode.window.showWarningMessage(message);
      }
    }
  }
}
