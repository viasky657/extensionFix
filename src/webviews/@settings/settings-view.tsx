import * as React from "react";
import { Preset } from "../../model";
import { Button } from "components/button";


export type SettingsViewProps = {
  presets: Preset[];
}

export function SettingsView(props: SettingsViewProps) {

  const { presets } = props;

  return (
    <main className="flex flex-col flex-grow">
      <header className="flex items-baseline gap-2">
        <h2 className="mr-auto">Your presets</h2>
        <Button variant="secondary">New preset</Button>
      </header>
      <ol className="p-2.5 flex flex-col gap-0.5">
        {presets.sort((a, b) => new Date(b.createdOn).getTime() - new Date(a.createdOn).getTime()).map((preset) => (
          <li className="flex gap-1.5 px-1.5 py-0.5 rounded hover:bg-[rgba(128,128,128,0.1)]">{preset.name}</li>
        ))}
      </ol>
    </main>
  );
}