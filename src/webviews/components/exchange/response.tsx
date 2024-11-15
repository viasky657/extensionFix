import * as React from "react"
import { Response, ResponsePart } from "../../../model"
import MarkdownRenderer from "../markdown-renderer"
import { ContextSummary } from "../context-summary"
import { Exchange, ExchangeContent, ExchangeHeader } from "./exchange-base"

type ToolType =
  | 'ListFiles'
  | 'SearchFileContentWithRegex'
  | 'OpenFile'
  | 'CodeEditing'
  | 'LSPDiagnostics'
  | 'AskFollowupQuestions'
  | 'AttemptCompletion'
  | 'RepoMapGeneration'

const toolIcons: Record<ToolType, string> = {
  ListFiles: 'codicon-search',
  SearchFileContentWithRegex: 'codicon-regex',
  OpenFile: 'codicon-folder-opened',
  CodeEditing: 'codicon-code',
  LSPDiagnostics: 'codicon-checklist',
  AskFollowupQuestions: 'codicon-comment-discussion',
  AttemptCompletion: 'codicon-wand',
  RepoMapGeneration: 'codicon-folder-library',
}

const Spinner = () => (
  <div
    className="w-4 h-4 border-2 border-blue-500 rounded-full animate-spin"
  />
)


function ParameterContent({ type, content, delta }: {
  type: string;
  content: string;
  delta: string
}) {

  switch (type) {
    case "fs_file_path":
    case "directory_path":
      return (
        <button
          onClick={() => {/* Handle path click */ }}
          className="text-descriptionForeground text-start group text-sm flex gap-2 px-2 py-2 border-descriptionForeground w-full"
        >
          <span aria-hidden className="codicon codicon-folder-opened flex-shrink-0 translate-y-0.5" />
          <span className="overflow-hidden flex-grow w-0 text-ellipsis whitespace-nowrap group-hover:underline">
            {content}
          </span>
        </button>
      )

    case "instruction":
      return (
        <div className="prose prose-invert prose-sm max-w-none rounded p-4 border border-descriptionForeground">
          <MarkdownRenderer rawMarkdown={content} />
        </div>
      )

    case "command":
      return (
        <div className="bg-sideBarSectionHeader-background rounded text-xs border border-sideBarSectionHeader-border">
          <div className="flex gap-2 text-editorHint-foreground px-2 py-2 border-b border-sideBarSectionHeader-border">
            <span aria-hidden className="codicon codicon-terminal flex-shrink-0 translate-y-0.5" />
            <span>Terminal commands</span>
          </div>
          <div className="px-2 py-2 space-y-1 font-mono">
            {content.split('\n').map((line, i) => (
              <div
                key={i}
                className={line === delta ? "text-editor-selectionForeground" : "text-editor-foreground"}
              >
                <span className="text-editor-foreground">$</span> {line}
              </div>
            ))}
          </div>
        </div>
      )

    case "question":
      return (
        <div className="bg-blue-500/10 rounded p-4 border-l-4 border border-blue-500">
          <div className="flex gap-2 text-blue-400 mb-2">
            <span aria-hidden className="flex-shrink-0 codicon codicon-comment-discussion translate-y-0.5" />
            <span className="font-medium">Question</span>
          </div>
          <div className="text-zinc-300">
            {content}
          </div>
        </div>
      )

    case "result":
      return (
        <div className="bg-green-950/30 rounded px-3 py-2 border border-green-600/30">
          <div className="flex gap-2 text-green-400 mb-2">
            <span aria-hidden className="flex-shrink codicon codicon-check translate-y-0.5" />
            <span className="font-medium">Result</span>
          </div>
          <div>
            {content}
          </div>
        </div>
      )

    case "regex_pattern":
    case "file_pattern":
      return (
        <div className="font-mono text-xs bg-zinc-800/50 rounded p-3">
          {content.split('\n').map((line, i) => (
            <div
              key={i}
            >
              {line}
            </div>
          ))}
        </div>
      )

    case "recursive":
      return (
        <div className="text-sm">
          <span>
            <span className="text-descriptionForeground" aria-hidden>Recursive: </span>
            {content === "true" ? "Yes" : "No"}
          </span>
        </div>
      )

    default:
      return (
        <div className="font-mono text-sm p-3">
          {content.split('\n').map((line, i) => (
            <div key={i}>
              {line}
            </div>
          ))}
        </div>
      )
  }
}

export function ResponseViewItem(props: Response) {
  const { parts, context } = props

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
  )
}

function renderParameter(responsePart: ResponsePart) {
  if (responsePart.type === 'toolParameter') {
    const { parameterName, contentDelta, contentUpUntilNow } = responsePart.toolParameters
    return <div className="-mt-2">
      <span className="sr-only">{parameterName}</span>
      <ParameterContent
        type={parameterName}
        content={contentUpUntilNow}
        delta={contentDelta}
      />
    </div>
  }
  return null
}

function renderPart(part: ResponsePart, index: number, allParts: ResponsePart[]) {
  const nextPart = allParts[index + 1]
  const isThinkingFollowedByTool = part.type === "toolThinking" && nextPart && nextPart.type === "toolType"

  switch (part.type) {
    case "markdown":
      return (
        <MarkdownRenderer rawMarkdown={part.rawMarkdown} />
      )
    case "commandGroup":
      return (
        <div className="flex flex-wrap gap-2">
          {part.commands.map((command) => (
            <button
              key={command.command}
              className="bg-textLink.foreground hover:bg-blue-700 text-white px-2 py-1.5 rounded text-xs flex text-start gap-2 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {command.title}
            </button>
          ))}
        </div>
      )
    case "toolThinking":
      return (
        <div className={`flex items-start gap-3 text-zinc-400 text-sm ${isThinkingFollowedByTool ? 'pb-2' : ''}`}>
          {!isThinkingFollowedByTool && <Spinner />}
          <div className="flex-1">
            {part.markdown.rawMarkdown ? (
              <MarkdownRenderer rawMarkdown={part.markdown.rawMarkdown} />
            ) : (
              <span>Thinking...</span>
            )}
          </div>
        </div>
      )
    case "toolType":
      const icon = <span aria-hidden className={`flex-shrink-0 translate-y-0.5 codicon ${toolIcons[part.toolType as ToolType] || 'codicon-question'}`} />


      let label = part.toolType as string;

      switch (part.toolType) {
        case 'AskFollowupQuestions':
          label = 'Follow up question';
        case 'CodeEditing':
          label = 'Code editing';
        case 'LSPDiagnostics':
          label = 'LSP Diagnostics';
        case 'RepoMapGeneration':
          label = 'Repo map generation';
        case 'AttemptCompletion':
          label = 'Attempt completion';
        case 'ListFiles':
          label = 'List files';
        case 'OpenFile':
          label = 'Open file';
        case 'SearchFileContentWithRegex':
          label = 'Search content file with regex';
      }


      return (
        <div className="flex gap-2 bg-blue-500/10 rounded px-2 py-2">
          {icon}
          <span className="text-sm">{label}</span>
        </div>
      )
    default:
      return null
  }
}