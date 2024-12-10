import { z } from 'zod';
import * as React from 'react';
import { AnthropicModels, NewPreset, PermissionMode, Permissions, Preset, Provider, ProviderType, View } from '../../model';
import { PresetForm } from './form';
import { getPresets, PresetsData, usePresets } from './use-preset';
import { processFormData } from 'utils/form';
import { Link, LoaderFunctionArgs, useLoaderData, useNavigate } from 'react-router-dom';
import { Button } from 'components/button';
import { LoaderData } from 'utils/types';
import { ProgressIndicator } from 'components/progress-indicator';
import { Spinner } from 'components/spinner';
import { logError } from '../../completions/logger';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      button: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
      aside: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      dl: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDListElement>, HTMLDListElement>;
      dt: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      dd: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

type ViewData = {
  presetsData: PresetsData;
  selectedPreset?: Preset;
};

export async function loadPresets({ params }: LoaderFunctionArgs): Promise<ViewData> {
  const presetId = params.presetId as string;
  const presetsData = await getPresets();
  const selectedPreset = presetsData.presets.get(presetId);
  return {
    presetsData,
    selectedPreset,
  };
}

function printValidationIssues(issues: z.ZodError['issues']) {
  let tuples: [string, string][] = [];
  for (const issue of issues) {
    tuples.push([issue.path.join('.'), issue.message]);
  }
  return tuples;
}

export function PresetView() {
  const initialData = useLoaderData() as LoaderData<typeof loadPresets>;
  const { selectedPreset } = initialData;
  const { updatePreset, addPreset, deletePreset } = usePresets(initialData.presetsData);

  const navigate = useNavigate();

  const stableId = React.useId();

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formErrors, setFormErrors] = React.useState<[string, string][]>();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    setIsSubmitting(true);
    event.preventDefault();
    setFormErrors(undefined);
    const form = event.currentTarget;
    try {
      const result = parsePresetFormData(new FormData(form));
      let response;
      if (result.type === 'preset') {
        response = await updatePreset(result);
      } else if (result.type === 'new-preset') {
        response = await addPreset(result);
      }

      if (response?.valid) {
        navigate(`/${View.Settings}`);
      } else {
        setFormErrors([['Validation Error', response?.error || 'Unknown error']]);
      }
    } catch (unknownError) {
      logError(unknownError instanceof Error ? unknownError : new Error(unknownError as string));
    } finally {
      setIsSubmitting(false);
    }
  }

  function onDeletePreset() {
    if (selectedPreset) {
      deletePreset(selectedPreset.id);
      navigate(`/${View.Settings}`);
    }
  }

  function onGoBack() {
    navigate(-1);
  }

  return (
    <main className="relative flex flex-grow flex-col gap-2 p-2">
      {isSubmitting && <ProgressIndicator className="absolute inset-x-0 top-0 z-20" />}
      <header className="mb-2 flex items-start gap-2 text-description">
        <button
          type="button"
          className="group relative overflow-hidden rounded p-1"
          onClick={onGoBack}
        >
          <div className="absolute inset-0 -z-10 brightness-125 group-hover:bg-panel-background" />
          <span aria-hidden className="codicon codicon-chevron-left translate-y-0.5" />
          <span className="sr-only">Go back</span>
        </button>
        <h2 className="text-base">{selectedPreset?.name || 'New preset'}</h2>
      </header>
      <PresetForm formId={stableId} onSubmit={onSubmit} initialData={selectedPreset} />
      {formErrors && (
        <aside className="relative isolate my-2">
          <div className="absolute inset-0 -z-10 rounded-sm bg-error-foreground opacity-25" />
          <div className="absolute inset-0 -z-10 rounded-sm border border-error-foreground opacity-50" />
          <dl className="p-2">
            {formErrors.map(([id, message]: [string, string]) => (
              <React.Fragment key={id}>
                <dt className="mt-4 font-medium text-foreground first:mt-0">{id}</dt>
                <dd className="mt-1 text-foreground">{message}</dd>
              </React.Fragment>
            ))}
          </dl>
        </aside>
      )}
      <div className="flex justify-end gap-2">
        <Button variant="secondary" asChild>
          <Link to={`/${View.Settings}`}>Cancel</Link>
        </Button>
        <Button type="submit" variant="primary" form={stableId} disabled={isSubmitting}>
          {isSubmitting && <Spinner className="h-3 w-3 border-b-current" />}
          Save
        </Button>
      </div>
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="destructive"
          onClick={onDeletePreset}
          disabled={isSubmitting}
        >
          Delete preset
        </Button>
      </div>
    </main>
  );
}

const NewPresetSchema = z.object({
  provider: z.nativeEnum(Provider),
  model: z.string(),
  apiKey: z.string(),
  customBaseUrl: z.string().optional(),
  permissions: z.custom<Permissions>(),
  customInstructions: z.string(),
  name: z.string(),
  temperature: z.number().min(0).max(1),
});

// Full Preset schema (with id and createdOn)
const PresetSchema = NewPresetSchema.extend({
  id: z.string(),
  createdOn: z.string(),
  temperature: z.number()
    .min(0, "Temperature must be at least 0")
    .max(1, "Temperature must not exceed 1")
    .default(0.2),
  permissions: z.object({
    mode: z.nativeEnum(PermissionMode),
    autoApprove: z.boolean(),
    codeEditing: z.boolean(),
    fileAccess: z.boolean(),
    terminalCommands: z.boolean()
  })
});

function parsePresetFormData(formData: FormData): Preset | NewPreset {
  const data = processFormData(formData);
  return {
    ...data,
    type: 'new-preset',
    provider: data.provider as ProviderType,
    model: String(data.model),
    apiKey: String(data.apiKey),
    name: String(data.name),
    customInstructions: String(data.customInstructions || ''),
    temperature: Number(data.temperature) || 0.2,
    permissions: {
      mode: data.permissionMode as PermissionMode,
      autoApprove: data.autoApprove === 'on',
      codeEditing: data.codeEditing === 'on',
      fileAccess: data.fileAccess === 'on',
      terminalCommands: data.terminalCommands === 'on',
    }
  };
}
