import * as React from "react";
import { Preset } from "../../model";
import { PresetForm } from "./form";

export interface PresetViewProps {
  preset?: Preset;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
}

export function PresetView(props: PresetViewProps) {
  const { preset, onSubmit } = props;

  return (
    <main className="flex flex-col flex-grow">
      <header>
        <h2>{preset?.name || 'New preset'}</h2>
      </header>
      <div className="px-4 py-2 flex flex-col gap-2">
        <PresetForm onSubmit={onSubmit} initialData={preset}/>
      </div>
    </main>
  );
}