import * as React from "react";
import { Preset, View } from "../../model";
import { Button } from "components/button";
import { usePresets } from "./use-preset";
import { OpenViewFn } from "app";


export type SettingsViewProps = {
  openView: OpenViewFn;
}

export function SettingsView(props: SettingsViewProps) {

  const { openView } = props;
  const presets = usePresets();

  function addPreset() {
    openView(View.Preset, { preset: undefined });
  }

  return (
    <main className="flex flex-col flex-grow">
      <header className="flex items-baseline gap-2">
        <h2 className="mr-auto">Your presets</h2>
        <Button variant="secondary" type='button' onClick={addPreset}>New preset</Button>
      </header>
      {presets.status === 'loading' && <div className="flex items-center justify-center">Loading...</div>}
      {presets.status === 'success' && presets.data.length > 0 && (<ol className="p-2.5 flex flex-col gap-0.5">
        {presets.data.sort((a, b) => new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime()).map((preset) => (
          <li key={preset.id}>
            <PresetItem preset={preset} openView={openView} />
          </li>
        ))}
      </ol>)}
      {presets.status === 'success' && presets.data.length === 0 && (
        <div>
          <p>No presets yet</p>
          <Button variant="secondary" type='button' onClick={addPreset}>Add new preset</Button>
        </div>
      )}
    </main>
  );
}


type PresetItemProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  preset: Preset;
  openView: OpenViewFn;
}

function PresetItem(props: PresetItemProps) {

  const { preset, openView } = props;

  function openPreset() {
    openView(View.Preset, { preset });
  }

  return <button onClick={openPreset} className="flex gap-1.5 px-1.5 py-0.5 rounded hover:bg-[rgba(128,128,128,0.1)]">{preset.name}</button>
}