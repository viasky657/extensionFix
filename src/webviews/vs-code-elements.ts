import "@vscode-elements/elements/dist/vscode-button/index.js";
import "@vscode-elements/elements/dist/vscode-textarea/index.js";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Temporary typing, should be improved
      "vscode-button": React.DetailedHTMLProps<
        React.ButtonHTMLAttributes<HTMLButtonElement>,
        HTMLButtonElement
      >;
      // Temporary typing, should be improved
      "vscode-textarea": React.DetailedHTMLProps<
        React.TextareaHTMLAttributes<HTMLTextAreaElement>,
        HTMLTextAreaElement
      >;
    }
  }
}
