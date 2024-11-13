import * as React from "react";
import { Event, ViewType, Task, View } from "../model";
import { TaskView } from "@task/view";
import { mockTask } from "mock/task";

interface vscode {
  postMessage(message: Record<string, any>): void;
}

declare const vscode: vscode;

function onMessage(event: React.FormEvent<HTMLFormElement>) {
  const form = event.currentTarget;
  const data = Object.fromEntries(new FormData(form));
  vscode.postMessage({ request: "new-request", data });
}

// Move this somewhere else
interface State {
  extensionReady: boolean;
  view: ViewType;
  currentTask?: Task;
  loadedTasks: Map<string, Task>;
}

const mockLoadedTasks = new Map();
mockLoadedTasks.set(mockTask.sessionId, mockTask);

const initialState: State = {
  extensionReady: false,
  view: View.Task,
  currentTask: mockTask,
  loadedTasks: mockLoadedTasks, // new Map(),
};

function reducer(state: State, action: Event) {
  const newState = structuredClone(state);

  if (action.type === "init") {
    newState.extensionReady = true;
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

const App = () => {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent<Event>) => {
      dispatch(event.data);
    };
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <div>
      <h1>Functional Components Work!</h1>
      <nav>
        <ul>
          <li>
            <button type="button">New</button>
          </li>
          <li>
            <button type="button">History</button>
          </li>
          <li>
            <button type="button">Settings</button>
          </li>
        </ul>
      </nav>
      {renderView(state)}
    </div>
  );
};

function renderView(state: State) {
  switch (state.view) {
    case "task":
      if (!state.currentTask) {
        return "Error"; // Implement better fallback
      }
      return <TaskView task={state.currentTask} onSubmit={onMessage} />;
    default:
      return "View not implemented";
  }
}

export default App;
