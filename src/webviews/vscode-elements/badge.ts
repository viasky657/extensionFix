import * as React from "react";
import "@vscode-elements/elements/dist/vscode-badge/index.js";
import { convertPropsToRegularHTMLAttributes } from "./convert-props";

interface VSCodeBadgeProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLSpanElement>,
    HTMLSpanElement
  > {
  variant: "default" | "counter" | "activity-bar-counter";
}

export function VSCodeBadge(props: VSCodeBadgeProps) {
  return React.createElement(
    "vscode-badge",
    convertPropsToRegularHTMLAttributes(props)
  );
}
