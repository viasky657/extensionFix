import "@vscode-elements/elements/dist/vscode-button/index.js";
import * as React from "react";
import { convertPropsToRegularHTMLAttributes } from "./convert-props";

export interface VSCodeButtonProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {}

export function VSCodeButton(props: VSCodeButtonProps) {
  return React.createElement(
    "vscode-button",
    convertPropsToRegularHTMLAttributes(props)
  );
}
