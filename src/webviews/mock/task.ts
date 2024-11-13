import { Task } from "../../model";

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
    cacheReads: 12,
    cacheWrites: 12,
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
      context: [],
    },
    {
      type: "response",
      username: "agent",
      exchangeId: "exchange_1",
      sessionId: "session_12345",
      parts: [
        {
          type: "markdown",
          rawMarkdown: "The capital of France is Paris.",
        },
      ],
      context: [],
    },
    {
      type: "request",
      username: "user123",
      exchangeId: "exchange_2",
      sessionId: "session_12345",
      message: "Can you tell me more about Paris?",
      context: [],
    },
    {
      type: "response",
      username: "agent",
      exchangeId: "exchange_2",
      sessionId: "session_12345",
      parts: [
        {
          type: "markdown",
          rawMarkdown:
            "Paris is the capital city of France, known for its art, fashion, and culture. Famous landmarks include the Eiffel Tower, the Louvre Museum, and Notre-Dame Cathedral.",
        },
      ],
      context: [],
    },
  ],
};
