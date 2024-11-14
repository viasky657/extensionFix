import "@vscode-elements/elements/dist/vscode-form-container/index.js";
import * as React from "react";
import { convertPropsToRegularHTMLAttributes } from "./convert-props";

export interface VSCodeFormContainerProps
  extends React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>
   {}

export function VSCodeFormContainer(props: VSCodeFormContainerProps) {
  return React.createElement(
    "vscode-form-container",
    convertPropsToRegularHTMLAttributes(props)
  );
}
