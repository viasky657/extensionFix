import * as React from "react";
import { Preset } from "../../model";
import { PresetForm } from "./form";

export interface PresetViewProps {
  preset: Preset;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
}

export function PresetView(props: PresetViewProps) {
  const { preset, onSubmit } = props;
  const { provider, model, apiKey, customBaseUrl, permissions, customInstructions, name } = preset;


  return (
    <main className="flex flex-col flex-grow">
      <header>
        <h2>{name}</h2>
      </header>
      <div className="px-4 py-2 flex flex-col gap-2">
        <PresetForm onSubmit={onSubmit} initialData={preset}/>
      </div>
    </main>
  );
}