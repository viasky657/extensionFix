import "@vscode-elements/elements/dist/vscode-textfield/index.js";
import * as React from "react";
import { convertPropsToRegularHTMLAttributes } from "./convert-props";

export interface VSCodeTextfieldProps
  extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLInputElement>, HTMLInputElement>
   {}

export function VSCodeTextfield(props: VSCodeTextfieldProps) {
  return React.createElement(
    "vscode-textfield",
    convertPropsToRegularHTMLAttributes(props)
  );
}
