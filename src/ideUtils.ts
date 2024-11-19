import * as path from "node:path";
import * as vscode from "vscode";

function windowsToPosix(windowsPath: string): string {
    let posixPath = windowsPath.split("\\").join("/");
    if (posixPath[1] === ":") {
        posixPath = posixPath.slice(2);
    }
    // posixPath = posixPath.replace(" ", "\\ ");
    return posixPath;
}

function isWindowsLocalButNotRemote(): boolean {
    return (
        vscode.env.remoteName !== undefined &&
        [
            "wsl",
            "ssh-remote",
            "dev-container",
            "attached-container",
            "tunnel",
        ].includes(vscode.env.remoteName) &&
        process.platform === "win32"
    );
}

export function uriFromFilePath(filepath: string): vscode.Uri {
    let finalPath = filepath;
    if (vscode.env.remoteName) {
        if (isWindowsLocalButNotRemote()) {
            finalPath = windowsToPosix(filepath);
        }
        return vscode.Uri.parse(
            `vscode-remote://${vscode.env.remoteName}${finalPath}`,
        );
    } else {
        return vscode.Uri.file(finalPath);
    }
}

export class VSCodeIDEUtils {
    private _cachedPath: path.PlatformPath | undefined;
    get path(): path.PlatformPath {
        if (this._cachedPath) {
            return this._cachedPath;
        }

        // Return "path" module for either windows or posix depending on sample workspace folder path format
        const sampleWorkspaceFolder =
            vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        const isWindows = sampleWorkspaceFolder
            ? !sampleWorkspaceFolder.startsWith("/")
            : false;

        this._cachedPath = isWindows ? path.win32 : path.posix;
        return this._cachedPath;
    }

    private _workspaceDirectories: string[] | undefined = undefined;
    getWorkspaceDirectories(): string[] {
        if (this._workspaceDirectories === undefined) {
            this._workspaceDirectories =
                vscode.workspace.workspaceFolders?.map((folder) => folder.uri.fsPath) ||
                [];
        }

        return this._workspaceDirectories;
    }

    getAbsolutePath(filepath: string): string {
        const workspaceDirectories = this.getWorkspaceDirectories();
        if (!this.path.isAbsolute(filepath) && workspaceDirectories.length === 1) {
            return this.path.join(workspaceDirectories[0], filepath);
        } else {
            return filepath;
        }
    }
}
