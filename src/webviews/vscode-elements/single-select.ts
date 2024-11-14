import "@vscode-elements/elements/dist/vscode-single-select/index.js";
import * as React from "react";
import { convertPropsToRegularHTMLAttributes } from "./convert-props";

export interface VSCodeSingleSelectProps
  extends React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>
   {}

export function VSCodeSingleSelect(props: VSCodeSingleSelectProps) {
  return React.createElement(
    "vscode-single-select",
    convertPropsToRegularHTMLAttributes(props)
  );
}
