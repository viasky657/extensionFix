import "@vscode-elements/elements/dist/vscode-option/index.js";
import * as React from "react";
import { convertPropsToRegularHTMLAttributes } from "./convert-props";

export interface VSCodeOptionProps
  extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLOptionElement>, HTMLOptionElement>
   {}

export function VSCodeOption(props: VSCodeOptionProps) {
  return React.createElement(
    "vscode-option",
    convertPropsToRegularHTMLAttributes(props)
  );
}
