
import { PresetView } from "@settings/preset-view";
import { WelcomeView } from "@settings/welcome-view";
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
        element: <WelcomeView />,
      },
      {
        path: View.Task,
        element: <TaskView />,
      },
      {
        path: View.Settings,
        element: <SettingsView />,
      },
      {
        path: `${View.Preset}/:presetId`,
        element: <PresetView />,
      }
    ]
  }
], {
  initialEntries: ["/welcome"]
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