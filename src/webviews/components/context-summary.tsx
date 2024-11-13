import * as React from "react";

interface ContextSummaryProps {
  context: string[];
}

// function getUniqueExtensions(uris: string[]): string[] {
//   return Array.from(
//     uris.reduce((acc, uri) => {
//       const match = uri.match(/\.([^.]+)$/);
//       if (match) {
//         acc.add(uri);
//       }
//       return acc;
//     }, new Set<string>())
//   );
// }

export function ContextSummary(props: ContextSummaryProps) {
  const { context } = props;
  //const urisWithUniqueIcons = getUniqueExtensions(context);
  const hasOneItem = context.length == 1;
  return (
    <p className="text-descriptionForeground">
      @ {context.length} {hasOneItem ? "item" : "items"}
    </p>
  );
}
