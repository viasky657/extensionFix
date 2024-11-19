import * as React from "react";
import { Event, View, ClientRequest, AppState } from "../model";
import { TaskView } from "@task/view";
import { PresetView } from "@settings/preset-view";
import LoadingSpinner from "components/loading-spinner";
import { SettingsView } from "@settings/settings-view";
import { WelcomeView } from "@settings/welcome-view";

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
    if (!newState.activePreset) {
      newState.view = View.Preset;
      return newState;
    }
    newState.activePreset = action.initialAppState.activePreset;
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
    newState.view = action.view;
    newState.currentTask = task;
    newState.isSidecarReady = action.isSidecarReady;
  } else if (action.type === "open-task") {
    const task = action.task;
    newState.view = View.Task;
    newState.currentTask = task;
  }

  if (action.type === "open-view") {
    newState.view = action.view;
  }

  return newState;
}

// export type OpenViewFn = <T extends keyof typeof routes>(view: T, viewProps: Parameters<(typeof routes)[T]>[0]) => void


const routes = {
  [View.Preset]: PresetView,
  [View.Task]: TaskView,
  [View.Settings]: SettingsView,
  [View.Welcome]: WelcomeView,
}
// First, let's create some helper types
type RouteComponents = typeof routes;
type RouteKey = keyof RouteComponents;

// This type maps a View to its corresponding props type
type RoutePropsMap = {
  [K in RouteKey]: Parameters<RouteComponents[K]>[0];
};

// This is the type for our route state
type RouteState<V extends RouteKey = RouteKey> = {
  view: V;
  props: RoutePropsMap[V];
};

function isRouteState<V extends RouteKey>(
  route: RouteState,
  view: V
): route is RouteState<V> {
  return route.view === view;
}

export type OpenViewFn = <T extends RouteKey>(view: T, viewProps: Parameters<RouteComponents[T]>[0]) => void


const App = () => {

  const [state, dispatch] = React.useReducer(reducer, initialState);
  const [currentRoute, setCurrentRoute] = React.useState<RouteState>({ view: View.Welcome, props: {} });

  function openView<T extends RouteKey>(
    view: T,
    viewProps: Parameters<typeof routes[T]>[0]
  ) {
    dispatch({ type: 'open-view', view });
    setCurrentRoute({ view, props: viewProps });
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

  let view: React.JSX.Element;
  if (isRouteState(currentRoute, View.Welcome)) {
    view = <WelcomeView />
  } else if (isRouteState(currentRoute, View.Task)) {
    view = <TaskView {...currentRoute.props} onSubmit={(event) => onMessage(event, state.currentTask?.sessionId)} />;
  } else if (isRouteState(currentRoute, View.Settings)) {
    view = <SettingsView openView={openView} />
  } else if (isRouteState(currentRoute, View.Preset)) {
    view = <PresetView {...currentRoute.props} />
  } else {
    view = <span>View not implemented</span>
  }

  return (
    <div className="h-full">
      {state.isSidecarReady ? view : <LoadingSpinner />}
    </div>
  );
}

export default App;



export const initialState: AppState = {
  extensionReady: false,
  isSidecarReady: false, // this is extra
  view: View.Task,
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