import { Task } from "model";
import { MarkdownString } from "vscode";

export const mockTask: Task = {
  summary: "Example task demonstrating a user request and responses",
  preset: {
    provider: "anthropic",
    model: "claude-3-5-sonnet-20241022",
    apiKey: "exampleApiKey123",
    customBaseUrl: "https://api.anthropic.com",
    permissions: {
      readData: "ask",
      writeData: "never",
    },
    customInstructions: "Answer as concisely as possible",
    name: "claude-sonnet-3.5",
  },
  usage: {
    inputTokens: 10,
    outputTokens: 50,
  },
  cost: 1,
  // MVP
  context: [],
  sessionId: "session_12345",
  originalQuery: "What is the capital of France?",
  exchanges: [
    {
      type: "request",
      username: "user123",
      exchangeId: "exchange_1",
      sessionId: "session_12345",
      message: "What is the capital of France?",
    },
    {
      type: "response",
      username: "agent",
      exchangeId: "exchange_1",
      sessionId: "session_12345",
      parts: [
        {
          type: "markdown",
          markdown: new MarkdownString("The capital of France is Paris."),
        },
      ],
    },
    {
      type: "request",
      username: "user123",
      exchangeId: "exchange_2",
      sessionId: "session_12345",
      message: "Can you tell me more about Paris?",
    },
    {
      type: "response",
      username: "agent",
      exchangeId: "exchange_2",
      sessionId: "session_12345",
      parts: [
        {
          type: "markdown",
          markdown: new MarkdownString(
            "Paris is the capital city of France, known for its art, fashion, and culture. Famous landmarks include the Eiffel Tower, the Louvre Museum, and Notre-Dame Cathedral."
          ),
        },
      ],
    },
  ],
};
