import "@vscode-elements/elements/dist/vscode-form-group/index.js";
import * as React from "react";
import { convertPropsToRegularHTMLAttributes } from "./convert-props";

export interface VSCodeFormGroupProps
  extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
   {}

export function VSCodeFormGroup(props: VSCodeFormGroupProps) {
  return React.createElement(
    "vscode-form-group",
    convertPropsToRegularHTMLAttributes(props)
  );
}
