import * as React from "react";
import { marked } from "marked";

interface MarkdownRendererProps {
  rawMarkdown: string;
}

interface MarkdownContentProps {
  markdownPromise: {
    read: () => string;
  };
}

// Helper function to create a suspended promise
const createSuspendedPromise = (markdown: string) => {
  let status: "pending" | "success" | "error" = "pending";
  let result: string;

  const promise = (async () => {
    try {
      result = await marked.parse(markdown);
      status = "success";
    } catch (error) {
      status = "error";
      result = String(error);
    }
  })();

  return {
    read(): string {
      if (status === "pending") throw promise;
      if (status === "error") throw new Error(result);
      return result;
    },
  };
};

// Component that renders the markdown
const MarkdownContent: React.FC<MarkdownContentProps> = ({
  markdownPromise,
}) => {
  const html = markdownPromise.read();

  return (
    <div
      className="markdown-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

// Error boundary component
class MarkdownErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="markdown-error">Error rendering markdown content</div>
      );
    }

    return this.props.children;
  }
}

// Main markdown renderer component
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ rawMarkdown }) => {
  const [markdownPromise, setMarkdownPromise] = React.useState<{
    read: () => string;
  } | null>(null);
  const [previousHtml, setPreviousHtml] = React.useState<string>("");

  React.useEffect(() => {
    const updateMarkdown = async () => {
      if (rawMarkdown) {
        try {
          // Update previous HTML
          const parsed = await marked.parse(rawMarkdown);
          setPreviousHtml(parsed);

          // Set up new promise for next render
          setMarkdownPromise(createSuspendedPromise(rawMarkdown));
        } catch (error) {
          console.error("Error parsing markdown:", error);
        }
      }
    };

    void updateMarkdown();
  }, [rawMarkdown]);

  if (!markdownPromise) {
    return null;
  }

  return (
    <MarkdownErrorBoundary>
      <React.Suspense
        fallback={
          <div
            className="markdown-content"
            dangerouslySetInnerHTML={{ __html: previousHtml }}
          />
        }
      >
        <MarkdownContent markdownPromise={markdownPromise} />
      </React.Suspense>
    </MarkdownErrorBoundary>
  );
};

export default MarkdownRenderer;
