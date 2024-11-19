import * as React from "react";
import { Event, ClientRequest, AppState } from "../model";
import LoadingSpinner from "components/loading-spinner";
import { Outlet } from "react-router-dom";
import { useNavigationFromExtension } from "routes";

function reducer(state: AppState, action: Event) {

  const newState = structuredClone(state);
  console.log('State will update', { action, prevState: state });

  if (action.type === 'initial-state') {
    newState.activePreset = action.initialAppState.activePreset;
    newState.currentTask = action.initialAppState.currentTask;
    return newState;
  }

  if (action.type === "sidecar-ready-state") {
    newState.isSidecarReady = action.isSidecarReady;
  }

  if (action.type === "init-response") {
    newState.extensionReady = true;
    newState.isSidecarReady = action.isSidecarReady
  }

  return newState;
}


const App = () => {

  useNavigationFromExtension();

  const [state, dispatch] = React.useReducer(reducer, initialState);

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

  return (
    <div className="h-full">
      {state.isSidecarReady ? <Outlet /> : <LoadingSpinner />}
    </div>
  );
}

export default App;



export const initialState: AppState = {
  extensionReady: false,
  isSidecarReady: false, // this is extra
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