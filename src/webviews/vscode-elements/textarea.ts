import * as React from "react";
import "@vscode-elements/elements/dist/vscode-textarea/index.js";
import { convertPropsToRegularHTMLAttributes } from "./convert-props";

interface VSCodeTextAreaProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLTextAreaElement>,
    HTMLTextAreaElement
  > {}

export function VSCodeTextArea(props: VSCodeTextAreaProps) {
  return React.createElement(
    "vscode-textarea",
    convertPropsToRegularHTMLAttributes(props)
  );
}
