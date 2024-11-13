import * as vscode from "vscode";
import * as React from "react";

interface ContextSummaryProps {
  context: vscode.Uri[];
}

function getUniqueExtensions(uris: vscode.Uri[]): vscode.Uri[] {
  return Array.from(
    uris.reduce((acc, uri) => {
      const match = uri.path.match(/\.([^.]+)$/);
      if (match) {
        acc.add(uri);
      }
      return acc;
    }, new Set<vscode.Uri>())
  );
}

export function ContextSummary(props: ContextSummaryProps) {
  const { context } = props;
  const urisWithUniqueIcons = getUniqueExtensions(context);

  const hasOneItem = context.length == 1;
  return (
    <p className="text-descriptionForeground">
      <span aria-hidden>
        {urisWithUniqueIcons.map((uri) => {
          const treeItem = new vscode.TreeItem("");
          treeItem.resourceUri = uri;
          // TODO(g-danna) not sure this works
          return <span className={`file-icon ${treeItem.iconPath}`} />;
        })}
      </span>
      <span>
        @ {context.length} {hasOneItem ? "item" : "items"}
      </span>
    </p>
  );
}
