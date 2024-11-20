import * as React from 'react';
import { Response, ResponsePart } from '../../../model';
import MarkdownRenderer from '../markdown-renderer';
import { ContextSummary } from '../context-summary';
import { Exchange, ExchangeContent, ExchangeHeader } from './exchange-base';

type ToolType =
  | 'ListFiles'
  | 'SearchFileContentWithRegex'
  | 'OpenFile'
  | 'CodeEditing'
  | 'LSPDiagnostics'
  | 'AskFollowupQuestions'
  | 'AttemptCompletion'
  | 'RepoMapGeneration';

const toolIcons: Record<ToolType, string> = {
  ListFiles: 'codicon-search',
  SearchFileContentWithRegex: 'codicon-regex',
  OpenFile: 'codicon-folder-opened',
  CodeEditing: 'codicon-code',
  LSPDiagnostics: 'codicon-checklist',
  AskFollowupQuestions: 'codicon-comment-discussion',
  AttemptCompletion: 'codicon-wand',
  RepoMapGeneration: 'codicon-folder-library',
};

const Spinner = () => (
  <div className="h-4 w-4 animate-spin rounded-full border-2 border-transparent border-b-progress-bar-background" />
);

function ParameterContent({
  type,
  content,
  delta,
}: {
  type: string;
  content: string;
  delta: string;
}) {
  function handleOpenFile() {
    if (type === 'fs_file_path') {
      vscode.postMessage({
        type: 'open-file',
        fs_file_path: content,
      });
    }
  }

  switch (type) {
    case 'fs_file_path':
      return (
        <button
          onClick={handleOpenFile}
          className="group flex w-full gap-2 border-description px-2 py-2 text-start text-sm text-description"
        >
          <span aria-hidden className="codicon codicon-file flex-shrink-0 translate-y-0.5" />
          <span className="w-0 flex-grow overflow-hidden text-ellipsis whitespace-nowrap group-hover:underline">
            {content}
          </span>
        </button>
      );
    case 'directory_path':
      return (
        <button
          onClick={handleOpenFile}
          className="flex w-full gap-2 border-description px-2 py-2 text-start text-sm text-description"
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

    case 'instruction':
      return (
        <div className="prose prose-invert prose-sm max-w-none rounded border border-description p-4">
          <MarkdownRenderer rawMarkdown={content} />
        </div>
      );

    case 'command':
      return (
        <div className="bg-sideBarSectionHeader-background border-sideBarSectionHeader-border rounded border text-xs">
          <div className="text-editorHint-foreground border-sideBarSectionHeader-border flex gap-2 border-b px-2 py-2">
            <span aria-hidden className="codicon codicon-terminal flex-shrink-0 translate-y-0.5" />
            <span>Terminal commands</span>
          </div>
          <div className="space-y-1 px-2 py-2 font-mono">
            {content.split('\n').map((line, i) => (
              <div
                key={i}
                className={
                  line === delta ? 'text-editor-selectionForeground' : 'text-editor-foreground'
                }
              >
                <span className="text-editor-foreground">$</span> {line}
              </div>
            ))}
          </div>
        </div>
      );

    case 'question':
      return (
        <div className="rounded border border-l-4 border-blue-500 bg-blue-500/10 p-4">
          <div className="mb-2 flex gap-2 text-blue-400">
            <span
              aria-hidden
              className="codicon codicon-comment-discussion flex-shrink-0 translate-y-0.5"
            />
            <span className="font-medium">Question</span>
          </div>
          <div className="text-zinc-300">{content}</div>
        </div>
      );

    case 'result':
      return (
        <div className="rounded border border-green-600/30 bg-green-950/30 px-3 py-2">
          <div className="mb-2 flex gap-2 text-green-400">
            <span aria-hidden className="codicon codicon-check flex-shrink translate-y-0.5" />
            <span className="font-medium">Result</span>
          </div>
          <MarkdownRenderer rawMarkdown={content} />
        </div>
      );

    case 'regex_pattern':
    case 'file_pattern':
      return (
        <div className="rounded-xs bg-input-background p-3 font-mono text-xs">
          {content.split('\n').map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      );

    case 'recursive':
      return (
        <div className="text-sm">
          <span>
            <span className="text-description" aria-hidden>
              Recursive:{' '}
            </span>
            {content === 'true' ? 'Yes' : 'No'}
          </span>
        </div>
      );

    default:
      return (
        <div className="p-3 font-mono text-sm">
          {content.split('\n').map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      );
  }
}

export function ResponseViewItem(props: Response) {
  const { parts, context } = props;

  return (
    <Exchange>
      <ExchangeHeader>SOTA-SWE</ExchangeHeader>
      <ExchangeContent className="flex flex-col gap-4">
        {parts.length === 0 ? (
          <React.Fragment>
            <Spinner />
            <span className="sr-only">Thinking...</span>
          </React.Fragment>
        ) : (
          parts.map((part, index) => (
            <React.Fragment key={`${part.type}-${index}`}>
              {renderPart(part, index, parts)}
              {renderParameter(part)}
            </React.Fragment>
          ))
        )}
        {context.length > 0 && <ContextSummary context={context} />}
      </ExchangeContent>
    </Exchange>
  );
}

function renderParameter(responsePart: ResponsePart) {
  if (responsePart.type === 'toolParameter') {
    const { parameterName, contentDelta, contentUpUntilNow } = responsePart.toolParameters;
    return (
      <div className="-mt-2">
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
            <button
              key={command.command}
              className="flex gap-2 rounded px-2 py-1.5 text-start text-xs text-link-foreground transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-focus-border"
            >
              {command.title}
            </button>
          ))}
        </div>
      );
    case 'toolThinking':
      return (
        <div
          className={`flex items-start gap-3 text-sm text-description ${isThinkingFollowedByTool ? 'pb-2' : ''}`}
        >
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
    case 'toolType':
      const icon = (
        <span
          aria-hidden
          className={`codicon flex-shrink-0 translate-y-0.5 ${toolIcons[part.toolType as ToolType] || 'codicon-question'}`}
        />
      );

      let label = part.toolType as string;

      const toolTypeLabels = {
        AskFollowupQuestions: 'Follow up question',
        CodeEditing: 'Code editing',
        LSPDiagnostics: 'LSP Diagnostics',
        RepoMapGeneration: 'Repo map generation',
        AttemptCompletion: 'Attempt completion',
        ListFiles: 'List files',
        OpenFile: 'Open file',
        SearchFileContentWithRegex: 'Search content file with regex',
        TerminalCommand: 'Terminal command',
      };

      label = toolTypeLabels[part.toolType] || 'Unknown tool type';

      return (
        <div className="flex gap-2 rounded-xs px-2 py-2">
          {icon}
          <span className="text-sm">{label}</span>
        </div>
      );
    default:
      return null;
  }
}
