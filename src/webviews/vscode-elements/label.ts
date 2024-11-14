import "@vscode-elements/elements/dist/vscode-label/index.js";
import * as React from "react";
import { convertPropsToRegularHTMLAttributes } from "./convert-props";

export interface VSCodeLabelProps
  extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLLabelElement>, HTMLLabelElement>
   {}

export function VSCodeLabel(props: VSCodeLabelProps) {
  return React.createElement(
    "vscode-label",
    convertPropsToRegularHTMLAttributes(props)
  );
}
