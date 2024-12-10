import * as React from "react";
import { PresetForm } from "./form";
import { Button } from "components/button";
import { Provider, AnthropicModels, PermissionMode } from "../../model";
import { Preset } from "../../model";

export function WelcomeView() {

  const stableId = React.useId()
  const defaultPreset: Preset = {
    type: 'preset',
    id: '',  // Will be set on save
    createdOn: new Date().toISOString(),
    temperature: 0.2,
    provider: Provider.Anthropic,
    model: AnthropicModels.ClaudeSonnet.toString(),
    apiKey: '',
    name: '',
    permissions: {
      mode: PermissionMode.Ask,
      autoApprove: false,
      codeEditing: true,
      fileAccess: true,
      terminalCommands: true,
    },
    customInstructions: '',
  };

  return (
    <main className="flex flex-col flex-grow">
      <header>
        <h2>Welcome to SotaSWE</h2>
      </header>
      <div className="px-4 py-2 flex flex-col gap-2">
        <PresetForm formId={stableId} initialData={defaultPreset} />
        <Button type="submit" variant="primary" form={stableId}>Save</Button>
      </div>
    </main>
  );
}