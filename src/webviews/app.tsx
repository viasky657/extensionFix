import * as React from "react";
import { Event, View, AppState, ClientRequest } from "../model";
import { TaskView } from "@task/view";
import { PresetView } from "@preset/view";
import LoadingSpinner from "components/loading-spinner";
import { processFormData } from './utils/form';
import { v4 } from "uuid";

declare global {
  interface Window {
    vscode: {
      postMessage(message: ClientRequest): void;
    }
  }

  const vscode: {
    postMessage(message: ClientRequest): void;
  }
}

function onMessage(event: React.FormEvent<HTMLFormElement>, sessionId: string | undefined) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const query = data.get("query");
  if (sessionId === undefined) {
    return;
  }
  if (query && typeof query === "string") {
    vscode.postMessage({
      type: 'task-feedback',
      query,
      sessionId,
    });
  }

  // resets the form
  form.reset();
}

function onNewPreset(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  console.log(processFormData(data))
}

function reducer(state: AppState, action: Event) {
  const newState = structuredClone(state);

  if (action.type === 'initial-state') {
    newState.currentTask = action.initialAppState.currentTask;
    return newState;
  }
  if (action.type === 'task-update') {
    newState.currentTask = action.currentTask;
    return newState;
  }

  if (action.type === "sidecar-ready-state") {
    newState.isSidecarReady = action.isSidecarReady;
    return newState;
  }

  if (action.type === "init-response") {
    console.log("init", action.task);
    newState.extensionReady = true;

    const task = action.task;
    if (!newState.loadedTasks.has(task.sessionId)) {
      newState.loadedTasks.set(task.sessionId, task);
    }
    newState.view = action.view;
    newState.currentTask = task;

    newState.isSidecarReady = action.isSidecarReady;
  } else if (action.type === "open-task") {
    const task = action.task;
    if (!newState.loadedTasks.has(task.sessionId)) {
      newState.loadedTasks.set(task.sessionId, task);
    }
    newState.view = View.Task;
    newState.currentTask = task;
  }

  return newState;
}

export const initialState: AppState = {
  extensionReady: false,
  view: View.Task,
  isSidecarReady: false, // this is extra
  currentTask: {
    query: '',
    sessionId: v4(),
    context: [],
    cost: 0,
    usage: {
      inputTokens: 0,
      outputTokens: 0,
      cacheReads: 0,
      cacheWrites: 0,
    },
    exchanges: [],
    preset: {
      provider: "anthropic",
      model: "claude-3-5-sonnet-20241022",
      apiKey: "exampleApiKey123",
      customBaseUrl: "https://api.anthropic.com",
      permissions: {
        readData: "ask",
        writeData: "ask",
      },
      customInstructions: "Answer as concisely as possible",
      name: "claude-sonnet-3.5",
    },
    responseOnGoing: false,
  },
  loadedTasks: new Map()
};

const App = () => {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  React.useEffect(() => {
    console.log({ state })
    // fetches state from the extension
    vscode.postMessage({
      type: 'init',
    });

    const handleMessage = (event: MessageEvent<Event>) => {
      dispatch(event.data);
    };
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);


  // piping the current state from the bridge
  React.useEffect(() => {
    // handles messages from the extension
    const messageHandler = (event: MessageEvent) => {
      const message = event.data;

      // Only PanelProvider sends updateState messages
      if (message.command === 'initial-state') {
        dispatch({
          initialAppState: message.initialAppState,
          type: 'initial-state',
        });
      }

      if (message.command === 'state-updated') {
        dispatch({
          type: 'task-update',
          currentTask: message.initialAppState.currentTask,
        });
      }
    };

    // listen for messages
    window.addEventListener('message', messageHandler);
    return () => window.removeEventListener('message', messageHandler);
  }, []);

  return (
    <div className="h-full">
      {state.isSidecarReady ? renderView(state) : <LoadingSpinner />}
    </div>
  );
}

function renderView(state: AppState) {
  switch (state.view) {
    case "task":
      return <TaskView task={state.currentTask} onSubmit={(event) => onMessage(event, state.currentTask?.sessionId)} />;
    case View.Preset:
      return <PresetView onSubmit={onNewPreset} />
    default:
      return "View not implemented";
  }
}

export default App;
