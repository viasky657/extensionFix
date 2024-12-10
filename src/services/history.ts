import * as vscode from 'vscode';
import { Preset, Task } from '../model';

export class HistoryService {
  private static readonly HISTORY_KEY = 'chat_history';
  
  private validatePreset(preset: Preset) {
    if (typeof preset.temperature !== 'number' || 
        preset.temperature < 0 || 
        preset.temperature > 1) {
      throw new Error('Invalid temperature value in preset history');
    }
    return true;
  }
  
  public async addToHistory(task: Task) {
    this.validatePreset(task.preset);
    const history = await HistoryService.getHistory();
    history.unshift(task);
    
    // Keep only last 100 conversations
    const trimmedHistory = history.slice(0, 100);
    
    await vscode.workspace.getConfiguration().update(
      HistoryService.HISTORY_KEY,
      trimmedHistory,
      vscode.ConfigurationTarget.Global
    );
  }
  
  static async getHistory(): Promise<Task[]> {
    const config = vscode.workspace.getConfiguration();
    return config.get(this.HISTORY_KEY, []);
  }
  
  static async clearHistory(): Promise<void> {
    await vscode.workspace.getConfiguration().update(
      this.HISTORY_KEY,
      [],
      vscode.ConfigurationTarget.Global
    );
  }
} 