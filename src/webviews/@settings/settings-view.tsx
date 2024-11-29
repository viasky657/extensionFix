import * as React from 'react';
import { Preset, View } from '../../model';
import { Button } from 'components/button';
import { getPresets, PresetsData, usePresets } from './use-preset';
import { cn } from 'utils/cn';
import { Link, useLoaderData } from 'react-router-dom';
import { PresetLogo } from 'components/preset';
import { LoaderData } from 'utils/types';

type ViewData = PresetsData;

export async function loadSettings(): Promise<ViewData> {
  return await getPresets();
}

export function SettingsView() {
  const initialData = useLoaderData() as LoaderData<typeof loadSettings>;
  const { data, setActivePreset } = usePresets(initialData);

  const presetsArray = Array.from(data.presets.values()).sort(
    (a, b) => new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime()
  );

  return (
    <main className="flex flex-grow flex-col px-3 py-2">
      <header className="flex items-baseline gap-2">
        <h2 className="mr-auto text-base text-description">Your presets</h2>
        <Button variant="secondary" asChild>
          <Link to={`/${View.Preset}`} className="hover:text-button-secondary-foreground">
            Create new
          </Link>
        </Button>
      </header>
      {presetsArray.length > 0 && (
        <ol className="isolate mt-4 flex flex-col gap-1">
          {presetsArray.map((preset) => (
            <li key={preset.id}>
              <PresetItem
                preset={preset}
                setActivePreset={setActivePreset}
                isActivePreset={data.activePresetId === preset.id}
              />
            </li>
          ))}
        </ol>
      )}
      {presetsArray.length === 0 && (
        <div>
          <p>No presets yet</p>
          <Button variant="secondary" type="button" asChild>
            <Link to={`/${View.Preset}`}>Create new preset</Link>
          </Button>
        </div>
      )}
    </main>
  );
}

type PresetItemProps = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> & {
  preset: Preset;
  isActivePreset: boolean;
  setActivePreset: (presetId: string) => void;
};

function PresetItem(props: PresetItemProps) {
  const { preset, setActivePreset, isActivePreset } = props;

  function onSetActivePreset() {
    setActivePreset(preset.id);
  }

  return (
    <div className="group/preset relative flex gap-3 hover:z-10">
      <div className="absolute -inset-1 -z-10 rounded-sm bg-panel-background transition-all group-hover/preset:brightness-125" />
      <Link
        to={`/preset/${preset.id}`}
        className="flex flex-grow gap-1 p-1 text-left text-description group-hover/preset:text-foreground"
      >
        <PresetLogo provider={preset.provider} className="h-4 w-4 translate-y-1" />
        {preset.name}
      </Link>
      <button
        className="group/active -my-1 flex w-8 items-center justify-center"
        onClick={onSetActivePreset}
        disabled={isActivePreset}
      >
        <span
          className={cn(
            'codicon codicon-check p-1 group-hover/active:opacity-80',
            isActivePreset ? 'opacity-100' : 'opacity-0'
          )}
        />
        <span className="sr-only">
          {isActivePreset ? 'Active preset' : 'Click to set as active preset'}
        </span>
      </button>
    </div>
  );
}
