import Shiki from '@shikijs/markdown-it';
// @ts-ignore
import markdownit from 'markdown-it';
import * as React from 'react';

interface MarkdownRendererProps {
  rawMarkdown: string;
}

interface MarkdownContentProps {
  markdownPromise: {
    read: () => string;
  };
}

// Initialize markdown-it instance with async setup for Shiki
const initializeMarkdownIt = async () => {
  const md = new markdownit();

  md.use(
    await Shiki({
      defaultLanguage: 'markdown',
      fallbackLanguage: 'markdown',
      themes: {
        light: 'solarized-light',
        dark: 'solarized-dark',
      },
    })
  );

  return md;
};

let mdInstance: ReturnType<typeof markdownit> | null = null;
let initPromise: Promise<ReturnType<typeof markdownit>> | null = null;

const getMarkdownIt = async () => {
  if (mdInstance) return mdInstance;
  if (!initPromise) {
    initPromise = initializeMarkdownIt().then((md) => {
      mdInstance = md;
      return md;
    });
  }
  return initPromise;
};

// Helper function to create a suspended promise
const createSuspendedPromise = (markdown: string) => {
  let status: 'pending' | 'success' | 'error' = 'pending';
  let result: string;

  const promise = (async () => {
    try {
      const md = await getMarkdownIt();
      result = md.render(markdown);
      status = 'success';
    } catch (error) {
      status = 'error';
      result = String(error);
    }
  })();

  return {
    read(): string {
      if (status === 'pending') throw promise;
      if (status === 'error') throw new Error(result);
      return result;
    },
  };
};

// Component that renders the markdown
const MarkdownContent: React.FC<MarkdownContentProps> = ({ markdownPromise }) => {
  const html = markdownPromise.read();

  return <div className="markdown-content" dangerouslySetInnerHTML={{ __html: html }} />;
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
      return <div className="markdown-error">Error rendering markdown content</div>;
    }

    return this.props.children;
  }
}

// Main markdown renderer component
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ rawMarkdown }) => {
  const [markdownPromise, setMarkdownPromise] = React.useState<{
    read: () => string;
  } | null>(null);
  const [previousHtml, setPreviousHtml] = React.useState<string>('');

  React.useEffect(() => {
    const updateMarkdown = async () => {
      if (rawMarkdown) {
        try {
          // Update previous HTML
          const md = await getMarkdownIt();
          const parsed = md.render(rawMarkdown);
          setPreviousHtml(parsed);

          // Set up new promise for next render
          setMarkdownPromise(createSuspendedPromise(rawMarkdown));
        } catch (error) {
          console.error('Error parsing markdown:', error);
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
          <div className="markdown-content" dangerouslySetInnerHTML={{ __html: previousHtml }} />
        }
      >
        <MarkdownContent markdownPromise={markdownPromise} />
      </React.Suspense>
    </MarkdownErrorBoundary>
  );
};

export default MarkdownRenderer;
