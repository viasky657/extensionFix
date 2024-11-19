import * as React from "react";
import { Event, NewPreset, Preset } from "../../model";


export enum Status {
  Idle = "idle",
  Loading = "loading",
  Success = "success",
  Error = "error",
}

type AsyncState<T> =
  | { status: Status.Idle; data: undefined }
  | { status: Status.Loading; data: undefined }
  | { status: Status.Success; data: T }
  | { status: Status.Error; data: undefined };


function getPresets() {
  vscode.postMessage({
    type: 'get-presets'
  });
}

export function usePresets() {
  const [state, setState] = React.useState<AsyncState<{ presets: Preset[], activePresetId: string }>>({ status: Status.Idle, data: undefined });

  React.useEffect(() => {
    setState({ data: undefined, status: Status.Loading });
    getPresets();
  }, [])

  React.useEffect(() => {
    const handleMessage = (event: MessageEvent<Event>) => {
      if (event.data.type === 'presets-loaded') {
        setState({ status: Status.Success, data: event.data });
      }
    };
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);


  function addPreset(preset: NewPreset) {
    vscode.postMessage({
      type: 'add-preset',
      preset,
    });
    getPresets();
  }

  function updatePreset(preset: Preset) {
    vscode.postMessage({
      type: 'update-preset',
      preset,
    });
    getPresets();
  }

  function setActivePreset(presetId: string) {
    vscode.postMessage({
      type: 'set-active-preset',
      presetId,
    });
    getPresets();
  }

  return Object.assign(state, { addPreset, updatePreset, setActivePreset });
}