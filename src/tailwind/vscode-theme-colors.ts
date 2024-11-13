export function addVSCodeThemeColors(
  colorsIds: string[]
): Record<string, string> {
  let tokens: Record<string, string> = {};
  for (const id of colorsIds) {
    const cssPropName = `--vsc${id.replace(".", "-")}`;
    const value = `rgb(var(${cssPropName}) / <alpha-value>)`;
    tokens[id] = value;
  }
  return tokens;
}
