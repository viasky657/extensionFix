import * as React from 'react';
import { Preset, View } from '../../model';
import { Button } from 'components/button';
import { getPresets, PresetsData, usePresets } from './use-preset';
import { cn } from 'utils/cn';
import { Link, useLoaderData } from 'react-router-dom';
import { PresetLogo } from 'components/preset';
import { LoaderData } from 'utils/types';
import { useState } from 'react';

type ViewData = PresetsData;

export async function loadSettings(): Promise<ViewData> {
  return await getPresets();
}

interface PermissionMode {
  value: 'ask' | 'auto';
  label: string;
  description: string;
}

const permissionModes: PermissionMode[] = [
  {
    value: 'ask',
    label: 'Ask for Permission',
    description: 'The agent will ask for permission before making any changes to the codebase.'
  },
  {
    value: 'auto',
    label: 'Automatic',
    description: 'The agent will automatically apply changes without asking for permission.'
  }
];

export function SettingsView() {
  const initialData = useLoaderData() as LoaderData<typeof loadSettings>;
  const { data, setActivePreset } = usePresets(initialData);
  const [permissionMode, setPermissionMode] = useState<'ask' | 'auto'>('ask');

  const presetsArray = Array.from(data.presets.values()).sort(
    (a, b) => new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime()
  );

  const permissionModeSection = (
    <div className="mb-4">
      <h3 className="text-sm font-medium mb-2">Permission Mode</h3>
      <div className="space-y-2">
        {permissionModes.map((mode) => (
          <div key={mode.value} className="flex items-start">
            <div className="flex items-center h-5">
              <input
                type="radio"
                name="permission-mode"
                value={mode.value}
                checked={permissionMode === mode.value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPermissionMode(e.target.value as 'ask' | 'auto')}
                className="focus:ring-primary h-4 w-4 text-primary border-gray-300"
              />
            </div>
            <div className="ml-3">
              <label className="font-medium text-gray-700">{mode.label}</label>
              <p className="text-gray-500 text-sm">{mode.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
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
      {permissionModeSection}
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

declare global {
  namespace JSX {
    interface IntrinsicElements {
      label: React.DetailedHTMLProps<React.LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>;
      div: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
      p: React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>;
    }
  }
}
