import * as React from "react"
import { Response, ResponsePart } from "../../../model"
import MarkdownRenderer from "../markdown-renderer"
import { ContextSummary } from "../context-summary"
import { motion, AnimatePresence } from "framer-motion"
import { FileSearch, Search, FolderOpen, Edit3, AlertCircle, HelpCircle, Wand2, GitBranch, Send, ChevronRight, Terminal, MessageSquare, CheckCircle2, ChevronDown, Code, Settings } from 'lucide-react'

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
  <motion.div
    className="w-4 h-4 border-2 border-blue-500 rounded-full"
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
  />
)


function ParameterContent({ type, content, delta }: { 
  type: string; 
  content: string; 
  delta: string 
}) {
  return (
    <div className="mt-2">
      {(() => {
        switch (type) {
          case "fs_file_path":
          case "directory_path":
            return (
              <button 
                onClick={() => {/* Handle path click */}}
                className="text-blue-400 hover:underline font-mono text-xs flex items-center gap-2 p-2 bg-zinc-800/30 rounded"
              >
                <FolderOpen className="w-4 h-4" />
                {content}
              </button>
            )
          
          case "instruction":
            return (
              <div className="prose prose-invert prose-sm max-w-none bg-zinc-800/30 rounded p-4 border border-zinc-700">
                <MarkdownRenderer rawMarkdown={content} />
              </div>
            )
          
          case "command":
            return (
              <div className="bg-zinc-900 rounded font-mono text-xs">
                <div className="flex items-center gap-2 text-zinc-400 px-4 py-2 border-b border-zinc-700">
                  <Terminal className="w-4 h-4" />
                  <span>Terminal</span>
                </div>
                <div className="p-4 space-y-1">
                  {content.split('\n').map((line, i) => (
                    <div 
                      key={i}
                      className={line === delta ? "text-blue-400" : "text-zinc-300"}
                    >
                      $ {line}
                    </div>
                  ))}
                </div>
              </div>
            )
          
          case "question":
            return (
              <div className="bg-blue-500/10 rounded p-4 border-l-4 border border-blue-500">
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
              <div className="bg-green-950/30 rounded p-4 border border-green-600/30">
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
              <div className="font-mono text-xs bg-zinc-800/50 rounded p-3">
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
              <div className="font-mono text-xs bg-zinc-800/50 rounded p-3">
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
      })()}
    </div>
  )
}

function ToolParameter({ name, content, delta }: { name: string; content: string; delta: string }) {
  return (
    <div className="pl-8 py-2">
      <div className="flex items-center gap-2 text-zinc-400 mb-1">
        <ChevronRight className="w-4 h-4" />
        <span className="font-mono">{name}:</span>
      </div>
      <ParameterContent 
        type={name} 
        content={content} 
        delta={delta}
      />
    </div>
  )
}

export function ResponseViewItem(props: Response) {
  const { parts, context } = props

  return (
    <div className="bg-zinc-900 text-zinc-300 flex flex-col h-full">
      <div className="text-zinc-400 text-xs py-2 px-4 border-b border-zinc-800">SOTA-SWE</div>
      <div className="flex-1 overflow-auto space-y-6 px-4 py-4">
        {parts.length === 0 ? (
          <div className="flex items-center justify-center h-full text-zinc-500">
            <Spinner />
            <span className="ml-2">Thinking...</span>
          </div>
        ) : (
          parts.map((part, index) => (
            <div key={`${part.type}-${index}`} className="space-y-2">
              {renderPart(part, index, parts)}
              {renderParameter(part)}
            </div>
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
    />
  }
  return null
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
            {part.markdown.rawMarkdown ? (
              <MarkdownRenderer rawMarkdown={part.markdown.rawMarkdown} />
            ) : (
              <span>Thinking...</span>
            )}
          </div>
        </div>
      )
    case "toolType":
      const Icon = toolIcons[part.toolType as ToolType] || HelpCircle
      return (
        <div className="flex items-center gap-2 bg-blue-500/10 rounded px-3 py-2">
          <Icon className="w-4 h-4 text-blue-400" />
          <span className="text-blue-400 text-sm">{part.toolType}</span>
        </div>
      )
    default:
      return null
  }
}