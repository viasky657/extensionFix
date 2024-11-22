import * as React from 'react';
import { Response, ResponsePart, ToolParameter, ToolParameterType, ToolType } from '../../../model';
import MarkdownRenderer from '../markdown-renderer';
import { ContextSummary } from '../context-summary';
import { Exchange, ExchangeContent, ExchangeHeader } from './exchange-base';
import FileIcon from 'components/fileicon';

const toolTypesInfo: Record<ToolType, { label: string; codiconId: string }> = {
  [ToolType.AskFollowupQuestions]: { label: 'Follow up question', codiconId: 'comment-discussion' },
  [ToolType.ListFiles]: { label: 'List files', codiconId: 'search' },
  [ToolType.OpenFile]: { label: 'Reading', codiconId: 'folder-opened' },
  [ToolType.SearchFileContentWithRegex]: {
    label: 'Search content file with regex',
    codiconId: 'regex',
  },
  [ToolType.TerminalCommand]: { label: 'Terminal command', codiconId: 'terminal' },
  [ToolType.CodeEditing]: { label: 'Editing', codiconId: 'code' },
  [ToolType.LSPDiagnostics]: { label: 'LSP Diagnostics', codiconId: 'checklist' },
  [ToolType.AttemptCompletion]: { label: 'Attempt completion', codiconId: 'wand' },
  [ToolType.RepoMapGeneration]: { label: 'Repo map generation', codiconId: 'folder-library' },
};

const Spinner = () => (
  <div className="h-4 w-4 animate-spin rounded-full border-2 border-transparent border-b-progress-bar-background" />
);

function ParameterContent({
  type,
  content,
  delta,
}: {
  type: ToolParameterType;
  content: string;
  delta: string;
}) {
  function handleOpenFile() {
    if (type === ToolParameter.FSFilePath) {
      vscode.postMessage({
        type: 'open-file',
        fs_file_path: content,
      });
    }
  }

  switch (type) {
    case ToolParameter.FSFilePath:
      return (
        <button
          onClick={handleOpenFile}
          className="group flex w-full gap-2 border-description text-start text-sm text-description"
        >
          <div className="flex-shrink-0 -translate-x-1">
            <FileIcon height="22px" width="22px" filename={content} />
          </div>
          <span className="w-0 flex-grow -translate-x-1.5 overflow-hidden text-ellipsis whitespace-nowrap group-hover:underline">
            {content.split(/[/\\]/).pop()}
          </span>
        </button>
      );
    case ToolParameter.DirectoryPath:
      return (
        <button
          onClick={handleOpenFile}
          className="flex w-full gap-2 border-description text-start text-sm text-description"
        >
          <span
            aria-hidden
            className="codicon codicon-folder-opened flex-shrink-0 translate-y-0.5"
          />
          <span className="w-0 flex-grow overflow-hidden text-ellipsis whitespace-nowrap">
            {content}
          </span>
        </button>
      );

    case ToolParameter.Instruction:
      return (
        <div className="prose prose-invert prose-sm">
          <MarkdownRenderer rawMarkdown={content} />
        </div>
      );

    case ToolParameter.Command:
      return (
        <div className="flex-flex-col relative isolate bg-terminal-background p-2 text-xs text-terminal-foreground">
          <div className="absolute inset-0 -z-10 rounded-xs border border-terminal-border opacity-50" />
          <pre className="-mt-0.5 flex flex-col space-y-1">
            {content.split('\n').map((line, i) => (
              <p key={i} className="overflow-auto">
                <span className="opacity-80">$</span> {line}
              </p>
            ))}
          </pre>
        </div>
      );

    case ToolParameter.Question:
      return (
        <div className="relative isolate p-2">
          <div className="bg-accent absolute inset-0 -z-10 opacity-10" />
          <div className="border-accent absolute inset-0 -z-10 border-l-2 opacity-50" />
          <div className="text-foreground">{content}</div>
        </div>
      );

    case ToolParameter.Result:
      return (
        <div className="relative isolate p-3 text-foreground">
          <div className="bg-success absolute inset-0 -z-10 opacity-10" />
          <div className="border-success absolute inset-0 -z-10 border-l-2 opacity-50" />
          <MarkdownRenderer rawMarkdown={content} />
        </div>
      );

    case ToolParameter.RegexPattern:
    case ToolParameter.FilePattern:
      return (
        <pre className="relative isolate rounded-xs bg-input-background p-2 text-xs">
          <div className="absolute inset-0 -z-10 rounded-xs border border-input-border opacity-50" />
          {content.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </pre>
      );

    case ToolParameter.Recursive:
      return (
        <div className="relative isolate rounded-xs p-2 text-xs">
          <div className="absolute inset-0 -z-10 rounded-xs bg-terminal-background opacity-50" />
          <span className="text-description">Recursive: </span>
          {content === 'true' ? 'Yes' : 'No'}
        </div>
      );

    default:
      return (
        <div className="p-2 text-sm">
          {content.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      );
  }
}

export function ResponseViewItem(props: Response) {
  const { parts, context } = props;

  return (
    <Exchange>
      {/* <ExchangeHeader>SOTA-SWE</ExchangeHeader> */}
      <ExchangeContent className="flex flex-col gap-2">
        {parts.length > 0 &&
          parts.map((part, index) => (
            <React.Fragment key={`${part.type}-${index}`}>
              {renderPart(part, index, parts)}
              {renderParameter(part)}
            </React.Fragment>
          ))}
        {context.length > 0 && <ContextSummary context={context} />}
      </ExchangeContent>
    </Exchange>
  );
}

function renderParameter(responsePart: ResponsePart) {
  if (responsePart.type === 'toolParameter') {
    const { parameterName, contentDelta, contentUpUntilNow } = responsePart.toolParameters;
    return (
      <div>
        <span className="sr-only">{parameterName}</span>
        <ParameterContent type={parameterName} content={contentUpUntilNow} delta={contentDelta} />
      </div>
    );
  }
  return null;
}

function renderPart(part: ResponsePart, index: number, allParts: ResponsePart[]) {
  const nextPart = allParts[index + 1];
  const isThinkingFollowedByTool =
    part.type === 'toolThinking' && nextPart && nextPart.type === 'toolType';

  switch (part.type) {
    case 'markdown':
      return <MarkdownRenderer rawMarkdown={part.rawMarkdown} />;
    case 'commandGroup':
      return (
        <div className="flex flex-wrap gap-2">
          {part.commands.map((command) => (
            <pre // Why was this a button?
              key={command.command}
              className="flex gap-2 rounded-xs border border-terminal-border bg-terminal-background px-2 py-1.5"
            >
              {command.title}
            </pre>
          ))}
        </div>
      );
    case 'toolThinking':
      return (
        <div className="flex items-start gap-3 text-sm text-description">
          {!isThinkingFollowedByTool && <Spinner />}
          <div className="flex-1">
            {part.markdown.rawMarkdown ? (
              <MarkdownRenderer rawMarkdown={part.markdown.rawMarkdown} />
            ) : (
              <span>Thinking...</span>
            )}
          </div>
        </div>
      );
    case 'toolType': {
      const { label, codiconId } = toolTypesInfo[part.toolType];

      return (
        <div className="mt-4 flex gap-1 pr-2 text-description">
          <span
            aria-hidden
            className={`codicon flex-shrink-0 translate-y-0.5 opacity-60 codicon-${codiconId}`}
          />
          <span className="text-sm opacity-75">{label}</span>
        </div>
      );
    }
    default:
      return null;
  }
}
