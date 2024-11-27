import { Event, NewPreset, Preset } from '../../model';
import { useAsync } from 'utils/hooks/use-async';

export type PresetsData = {
  presets: Map<string, Preset>;
  activePresetId?: string;
};

export async function getPresets() {
  return new Promise<PresetsData>((resolve) => {
    const handleMessage = (event: MessageEvent<Event>) => {
      if (event.data.type === 'presets-loaded') {
        const { presets: presetsTuples, activePresetId } = event.data;
        const presetsMap = new Map<string, Preset>();
        presetsTuples.forEach(([presetId, preset]) => {
          presetsMap.set(presetId, preset);
        });
        resolve({ presets: presetsMap, activePresetId });
        window.removeEventListener('message', handleMessage);
      }
    };
    window.addEventListener('message', handleMessage);

    vscode.postMessage({
      type: 'get-presets',
    });
  });
}

export function usePresets(initialData: PresetsData) {
  const presets = useAsync<PresetsData>(getPresets, { enabled: !!initialData, initialData });

  function addPreset(preset: NewPreset) {
    return new Promise<{ valid: boolean; error?: string }>((resolve) => {
      const handleMessage = (event: MessageEvent<Event>) => {
        if (event.data.type === 'add-preset/response') {
          presets.execute();
          resolve({ valid: event.data.valid, error: event.data.error });
          window.removeEventListener('message', handleMessage);
        }
      };
      window.addEventListener('message', handleMessage);

      vscode.postMessage({
        type: 'add-preset',
        preset,
      });
    });
  }

  function updatePreset(preset: Preset) {
    return new Promise<{ valid: boolean; error?: string }>((resolve) => {
      const handleMessage = (event: MessageEvent<Event>) => {
        if (event.data.type === 'update-preset/response') {
          presets.execute();
          resolve({ valid: event.data.valid, error: event.data.error });
          window.removeEventListener('message', handleMessage);
        }
      };
      window.addEventListener('message', handleMessage);

      vscode.postMessage({
        type: 'update-preset',
        preset,
      });
    });
  }

  function deletePreset(presetId: string) {
    vscode.postMessage({
      type: 'delete-preset',
      presetId,
    });
    presets.execute();
  }

  function setActivePreset(presetId: string) {
    vscode.postMessage({
      type: 'set-active-preset',
      presetId,
    });
    presets.execute();
  }

  return Object.assign(presets, { addPreset, updatePreset, deletePreset, setActivePreset });
}
