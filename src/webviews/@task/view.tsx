import { Exchange } from "./model"

interface TaskViewProps {
  summary: string,
  preset: Preset
  originalQuery: string,
  usage: Record<string, number> // metric, number of tokens
  context: any[] // temporary,
  exchanges: Exchange[]
}

export function TaskView() {
  
}