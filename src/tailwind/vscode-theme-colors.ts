export function addVSCodeThemeColors(
  colorsIds: string[]
): Record<string, string> {
  let tokens: Record<string, string> = {};
  for (const id of colorsIds) {
    const tokenName = id.replaceAll(".", "-");
    const cssPropName = `--vscode-${tokenName}`;
    tokens[tokenName] = cssPropName;
  }
  return tokens;
}
