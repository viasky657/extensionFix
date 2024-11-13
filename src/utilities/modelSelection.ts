import { LanguageModels, ModelProviders } from "vscode";
import { ModelSelection } from "vscode";

export namespace MockModelSelection {
    export const slowModel: string = "ClaudeSonnet";
    export const fastModel: string = "DeepSeekCoder33BInstruct";

    export const models: LanguageModels = {
        "Gpt4": {
            name: "GPT-4",
            contextLength: 8192,
            temperature: 0.2,
            provider: {
                type: "codestory"
            }
        },
        "DeepSeekCoder33BInstruct": {
            name: "DeepSeek Coder 33B Instruct",
            contextLength: 16384,
            temperature: 0.2,
            provider: {
                type: "codestory"
            }
        },
        "ClaudeSonnet": {
            name: "Claude Sonnet",
            contextLength: 200000,
            temperature: 0.2,
            provider: {
                type: "codestory"
            }
        },
        "ClaudeHaiku": {
            name: "Claude Haiku",
            contextLength: 200000,
            temperature: 0.2,
            provider: {
                type: "codestory"
            }
        }
    };

    export const providers: ModelProviders = {
        "codestory": {
            name: "CodeStory"
        },
        "ollama": {
            name: "Ollama"
        }
    };

    export function getConfiguration(): Promise<ModelSelection> {
        return Promise.resolve({
            slowModel,
            fastModel,
            models,
            providers,
        });
    }
}