import * as React from "react";
import { Event, View, ClientRequest, Task, AppState, ViewType, Preset, NewPreset } from "../model";
import { TaskView, TaskViewProps } from "@task/view";
import { PresetView, PresetViewProps } from "@settings/preset-view";
import LoadingSpinner from "components/loading-spinner";
import { v4 } from "uuid";
import { SettingsView, SettingsViewProps } from "@settings/settings-view";
import { WelcomeView, WelcomeViewProps } from "@settings/welcome-view";

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

function reducer(state: AppState, action: Event) {

  const newState = structuredClone(state);
  console.log('State will update', { action, prevState: state });

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

  if (action.type === "open-view") {
    newState.view = action.view;
  }

  return newState;
}

export type OpenViewFn = <T extends keyof typeof routes>(view: T, viewProps: Parameters<(typeof routes)[T]>[0]) => void

const App = () => {

  const [state, dispatch] = React.useReducer(reducer, initialState);
  const [viewProps, setViewProps] = React.useState<Parameters<typeof routes[keyof typeof routes]>[0]>();

  function openView<T extends keyof typeof routes>(
    view: T,
    viewProps: Parameters<typeof routes[T]>[0]
  ) {
    dispatch({ type: 'open-view', view });
    setViewProps(viewProps);
  }

  React.useEffect(() => {
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
      {state.isSidecarReady ? renderView(state, viewProps, openView) : <LoadingSpinner />}
    </div>
  );
}
// TODO (@g-danna) fix this mess
function renderView(state: AppState, viewProps: PresetViewProps | TaskViewProps | SettingsViewProps | WelcomeViewProps | undefined, openView: OpenViewFn) {
  switch (state.view) {
    //case View.Welcome:
    //  return <WelcomeView />
    case View.Task:
      return <TaskView task={state.currentTask} onSubmit={(event) => onMessage(event, state.currentTask?.sessionId)} />;
    case View.Settings:
      return <SettingsView openView={openView} />
    case View.Preset:
      return <PresetView />
    default:
      return "View not implemented";
  }
}

export default App;


const routes = {
  [View.Preset]: PresetView,
  [View.Task]: TaskView,
  [View.Settings]: SettingsView,
  [View.Welcome]: WelcomeView,
}

export const initialState: AppState = {
  extensionReady: false,
  isSidecarReady: false, // this is extra
  view: View.Task,
  presets: [],
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
      type: 'preset',
      id: v4(),
      createdOn: new Date().toISOString(),
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