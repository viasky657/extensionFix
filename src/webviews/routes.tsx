
import { PresetView } from "@settings/preset-view";
import { TaskView } from "@task/view";
import App from "app";
import { createMemoryRouter, useNavigate } from "react-router-dom";
import { View, Event } from "../model";
import { SettingsView } from "@settings/settings-view";
import * as React from "react";

export const router = createMemoryRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: View.Welcome,
        element: <PresetView />,
      },
      {
        path: View.Task,
        element: <TaskView />,
      },
      {
        path: View.History,
        element: <TaskView />,
      },
      {
        path: View.Settings,
        element: <SettingsView />,
      },
      {
        path: `${View.Preset}/:presetId?`,
        element: <PresetView />,
      }
    ]
  }
], {
  initialEntries: ["/task"]
});

export function useNavigationFromExtension() {
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent<Event>) => {
      if (event.data.type === 'open-view') {
        navigate(event.data.view)
      }
    };
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);
}