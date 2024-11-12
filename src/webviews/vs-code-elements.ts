import "@vscode-elements/elements/dist/vscode-button/index.js";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "vscode-button": React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
    }
  }
}