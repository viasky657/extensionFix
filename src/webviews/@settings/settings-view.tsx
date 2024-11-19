import * as React from "react";
import { Preset, View } from "../../model";
import { Button } from "components/button";
import { usePresets } from "./use-preset";
import { cn } from "utils/cn";
import { Link } from "react-router-dom";


export function SettingsView() {

  const presets = usePresets();

  let presetsArray: Preset[] = []

  if (presets.status === 'success') {
    presetsArray = Array.from(presets.data.presets.values())
      .sort((a, b) => new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime());
  }

  return (
    <main className="flex flex-col flex-grow">
      <header className="flex items-baseline gap-2">
        <h2 className="mr-auto">Your presets</h2>
        <Button variant="secondary" asChild>
          <Link to={View.Preset}>Create new preset</Link>
        </Button>
      </header>
      {presets.status === 'loading' && <div className="flex items-center justify-center">Loading...</div>}
      {presets.status === 'success' && presetsArray.length > 0 && (<ol className="p-2.5 flex flex-col gap-0.5">
        {presetsArray.map((preset) => (
          <li key={preset.id}>
            <PresetItem preset={preset} setActivePreset={presets.setActivePreset} isActivePreset={presets.data.activePresetId === preset.id} />
          </li>
        ))}
      </ol>)}
      {presets.status === 'success' && presetsArray.length === 0 && (
        <div>
          <p>No presets yet</p>
          <Button variant="secondary" type='button' asChild>
            <Link to={View.Preset}>Create new preset</Link>
          </Button>
        </div>
      )}
    </main>
  );
}


type PresetItemProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  preset: Preset;
  isActivePreset: boolean;
  setActivePreset: (presetId: string) => void
}

function PresetItem(props: PresetItemProps) {

  const { preset, setActivePreset, isActivePreset } = props;

  function onSetActivePreset() {
    setActivePreset(preset.id)
  }

  return (
    <div className="flex gap-1.5 px-1.5 py-0.5 rounded hover:bg-[rgba(128,128,128,0.1)]">
      <Link to={`/preset/${preset.id}`} className="flex-grow text-left">{preset.name}</Link>
      <button className="w-8 h-full flex items-center justify-center" onClick={onSetActivePreset} disabled={isActivePreset}>
        <span className={cn(isActivePreset ? "opacity-100" : "opacity-0", "codicon codicon-check")} />
        <span className="sr-only">{isActivePreset ? "Active preset" : "Click to set as active preset"}</span>
      </button>
    </div>
  )
}