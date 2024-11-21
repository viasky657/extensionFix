import * as React from 'react';
import { Response, ResponsePart, ToolParameter, ToolParameterType } from '../../../model';
import MarkdownRenderer from '../markdown-renderer';
import { ContextSummary } from '../context-summary';
import { Exchange, ExchangeContent, ExchangeHeader } from './exchange-base';
import FileIcon from 'components/fileicon';

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
            <FileIcon height="24px" width="24px" filename={content} />
          </div>
          <span className="w-0 flex-grow -translate-x-2 overflow-hidden text-ellipsis whitespace-nowrap group-hover:underline">
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

    case ToolParameter.Question:
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

    case ToolParameter.Result:
      return (
        <div className="rounded border border-green-600/30 bg-green-950/30 px-3 py-2">
          <div className="mb-2 flex gap-2 text-green-400">
            <span aria-hidden className="codicon codicon-check flex-shrink translate-y-0.5" />
            <span className="font-medium">Result</span>
          </div>
          <MarkdownRenderer rawMarkdown={content} />
        </div>
      );

    case ToolParameter.RegexPattern:
    case ToolParameter.FilePattern:
      return (
        <div className="rounded-xs bg-input-background p-3 font-mono text-xs">
          {content.split('\n').map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      );

    case ToolParameter.Recursive:
      return (
        <div className="text-sm">
          <span>
            <span className="text-description">Recursive: </span>
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
        CodeEditing: 'Editing',
        LSPDiagnostics: 'LSP Diagnostics',
        RepoMapGeneration: 'Repo map generation',
        AttemptCompletion: 'Attempt completion',
        ListFiles: 'List files',
        OpenFile: 'Reading',
        SearchFileContentWithRegex: 'Search content file with regex',
        TerminalCommand: 'Terminal command',
      };

      label = toolTypeLabels[part.toolType] || 'Unknown tool type';

      return (
        <div className="flex gap-2">
          {icon}
          <span className="text-sm">{label}</span>
        </div>
      );
    default:
      return null;
  }
}
