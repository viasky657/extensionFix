import * as React from "react"
import { Response, ResponsePart } from "../../../model"
import MarkdownRenderer from "../markdown-renderer"
import { ContextSummary } from "../context-summary"
import { FileSearch, Search, FolderOpen, Edit3, AlertCircle, HelpCircle, Wand2, GitBranch, Send, ChevronRight, Terminal, MessageSquare, CheckCircle2 } from 'lucide-react'

interface ToolParameterFoundEvent {
  tool_parameter_input: {
    field_name: string
    field_content_up_until_now: string
    field_content_delta: string
  }
}

type ToolType =
  | 'ListFiles'
  | 'SearchFileContentWithRegex'
  | 'OpenFile'
  | 'CodeEditing'
  | 'LSPDiagnostics'
  | 'AskFollowupQuestions'
  | 'AttemptCompletion'
  | 'RepoMapGeneration'

const toolIcons: Record<ToolType, React.ElementType> = {
  ListFiles: Search,
  SearchFileContentWithRegex: FileSearch,
  OpenFile: FolderOpen,
  CodeEditing: Edit3,
  LSPDiagnostics: AlertCircle,
  AskFollowupQuestions: HelpCircle,
  AttemptCompletion: Wand2,
  RepoMapGeneration: GitBranch,
}

const Spinner = () => (
  <div className="animate-spin w-4 h-4">
    <div className="rounded-full border-2 border-zinc-600 border-t-blue-500 w-full h-full" />
  </div>
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
          onClick={() => {/* Handle path click */}}
          className="text-blue-400 hover:underline font-mono text-xs flex items-center gap-2"
        >
          <FolderOpen className="w-3 h-3" />
          {content}
        </button>
      )
    
    case "instruction":
      return (
        <div className="prose prose-invert prose-sm max-w-none bg-zinc-800/30 rounded-md p-3 border border-zinc-700">
          <MarkdownRenderer rawMarkdown={content} />
        </div>
      )
    
    case "command":
      return (
        <div className="bg-black rounded-md font-mono text-xs p-3 border border-zinc-800">
          <div className="flex items-center gap-2 text-zinc-500 mb-2">
            <Terminal className="w-3 h-3" />
            <span>Terminal</span>
          </div>
          {content.split('\n').map((line, i) => (
            <div 
              key={i}
              className={line === delta ? "text-blue-400" : "text-zinc-300"}
            >
              $ {line}
            </div>
          ))}
        </div>
      )
    
    case "question":
      return (
        <div className="bg-zinc-800/30 rounded-md p-3 border-l-4 border border-blue-500">
          <div className="flex items-center gap-2 text-blue-400 mb-2">
            <MessageSquare className="w-4 h-4" />
            <span className="font-medium">Question</span>
          </div>
          <div className="text-zinc-300">
            {content}
          </div>
        </div>
      )
    
    case "result":
      return (
        <div className="bg-zinc-800/30 rounded-md p-3 border border-green-600/30">
          <div className="flex items-center gap-2 text-green-400 mb-2">
            <CheckCircle2 className="w-4 h-4" />
            <span className="font-medium">Result</span>
          </div>
          <div className="text-zinc-300">
            {content}
          </div>
        </div>
      )
    
    case "regex_pattern":
    case "file_pattern":
      return (
        <div className="bg-zinc-800/50 rounded p-2 font-mono text-xs">
          {content.split('\n').map((line, i) => (
            <div 
              key={i}
              className={line === delta ? "text-blue-400" : "text-zinc-300"}
            >
              {line}
            </div>
          ))}
        </div>
      )
    
    case "recursive":
      return (
        <div className="font-mono text-xs">
          <span className={delta === content ? "text-blue-400" : "text-zinc-300"}>
            {content === "true" ? "Yes" : "No"}
          </span>
        </div>
      )
    
    default:
      return (
        <div className="bg-zinc-800/50 rounded p-2 font-mono text-xs">
          {content.split('\n').map((line, i) => (
            <div 
              key={i}
              className={line === delta ? "text-blue-400" : "text-zinc-300"}
            >
              {line}
            </div>
          ))}
        </div>
      )
  }
}

function ToolParameter({ name, content, delta }: { name: string; content: string; delta: string }) {
  return (
    <div className="ml-8 mt-2 text-sm">
      <div className="flex items-center gap-2 text-zinc-400">
        <ChevronRight className="w-3 h-3" />
        <span className="font-mono">{name}:</span>
      </div>
      <div className="ml-5 mt-1">
        <ParameterContent 
          type={name} 
          content={content} 
          delta={delta}
        />
      </div>
    </div>
  )
}

export function ResponseViewItem(props: Response) {
  const { parts, context } = props

  return (
    <div className="bg-zinc-900 text-zinc-300 flex flex-col h-full">
      <div className="text-zinc-400 text-xs py-2 px-4 border-b border-zinc-800">SOTA-SWE</div>
      <div className="flex-1 overflow-auto space-y-4 px-4 py-2">
        {parts.length === 0 ? (
          <div className="flex items-center justify-center h-full text-zinc-500">
            <Spinner />
            <span className="ml-2">Thinking...</span>
          </div>
        ) : (
          parts.map((part, index) => (
            <React.Fragment key={`${part.type}-${index}`}>
              {renderPart(part, index, parts)}
              {renderParameter(part)}
            </React.Fragment>
          ))
        )}
        {context.length > 0 && <ContextSummary context={context} />}
      </div>
    </div>
  )
}

function renderParameter(responsePart: ResponsePart) {
  if (responsePart.type === 'toolParameter') {
      return <ToolParameter
        key={`${responsePart.toolParameters.parameterName}`}
        name={responsePart.toolParameters.parameterName}
        content={responsePart.toolParameters.contentUpUntilNow}
        delta={responsePart.toolParameters.contentDelta}
      />;
  } else {
    return null;
  }
}

function renderPart(part: ResponsePart, index: number, allParts: ResponsePart[]) {
  const nextPart = allParts[index + 1]
  const isThinkingFollowedByTool = part.type === "toolThinking" && nextPart && nextPart.type === "toolType"

  switch (part.type) {
    case "markdown":
      return (
        <div className="text-zinc-300 text-sm">
          <MarkdownRenderer rawMarkdown={part.rawMarkdown} />
        </div>
      )
    case "commandGroup":
      return (
        <div className="flex flex-wrap gap-2">
          {part.commands.map((command) => (
            <button 
              key={command.command}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs flex items-center gap-2 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <MarkdownRenderer rawMarkdown={part.markdown.rawMarkdown} />
          </div>
        </div>
      )
    case "toolType":
      const Icon = toolIcons[part.toolType as ToolType] || HelpCircle
      return (
        <div className="flex items-center gap-2">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs flex items-center gap-2 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500">
            <Icon className="w-4 h-4" />
            <span>{part.toolType}</span>
          </button>
          {index < allParts.length - 1 && <div className="flex-1 border-t border-zinc-700 ml-2" />}
        </div>
      )
    default:
      return null
  }
}