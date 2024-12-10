import { AnthropicModels, Permissions, Preset, Provider, ProviderType, PermissionMode } from '../../model';
import * as React from 'react';
import { Checkbox } from 'components/checkbox';
import { Select, Option, SelectProps } from 'components/select';
import { Input } from 'components/input';
import { Textarea } from 'components/textarea';
import { cn } from 'utils/cn';
import { PresetLogo } from 'components/preset';
import { CheckedState } from '@radix-ui/react-checkbox';
import { capitalize } from 'utils/string';
import { Slider } from '../@components/slider';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      form: React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>;
      input: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
      label: React.DetailedHTMLProps<React.LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>;
      p: React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>;
      fieldset: React.DetailedHTMLProps<React.FieldsetHTMLAttributes<HTMLFieldSetElement>, HTMLFieldSetElement>;
      legend: React.DetailedHTMLProps<React.HTMLAttributes<HTMLLegendElement>, HTMLLegendElement>;
      span: React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
      div: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
    }
  }
}

interface PresetFormProps
  extends React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> {
  formId: string;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  initialData?: Preset;
  onPresetNameChange?: (name: string) => void;
  className?: string;
}

export function PresetForm(props: PresetFormProps) {
  const { className, formId, initialData, onPresetNameChange, ...rest } = props;

  const [selectedProvider, setSelectedProvider] = React.useState<ProviderType>(
    initialData?.provider || Provider.Anthropic
  );
  const [presetName, setPresetName] = React.useState(
    initialData?.name || capitalize(selectedProvider)
  );
  const [didSetPresetName, setDidSetPresetName] = React.useState(false);

  function onProviderChange(value: string) {
    setSelectedProvider(value as ProviderType);
    if (!didSetPresetName) {
      setPresetName(capitalize(value));
    }
  }

  function _onPresetNameChange(event: React.ChangeEvent<HTMLInputElement>) {
    setDidSetPresetName(true);
    const value = event.target.value;
    setPresetName(value);
    onPresetNameChange?.(value);
  }

  const [hasCustomBaseUrl, setHasCustomBaseUrl] = React.useState<CheckedState>(false);

  return (
    <form id={formId} className={cn('flex flex-col gap-4 text-description', className)} {...rest}>
      {initialData?.id && <input type="hidden" name="id" required value={initialData?.id} />}
      {initialData?.id && (
        <input type="hidden" name="createdOn" required value={initialData?.createdOn} />
      )}
      <label htmlFor="provider">
        <p className="font-medium text-foreground">Provider</p>
        <Select
          className="mt-1 w-full"
          id="provider"
          name="provider"
          required
          value={selectedProvider}
          onValueChange={onProviderChange}
        >
          {Object.keys(Provider).filter(key => isNaN(Number(key))).map((provider) => (
            <Option key={provider} value={Provider[provider as keyof typeof Provider]}>
              <div className="flex gap-2">
                <PresetLogo className="flex-shrink-0 translate-y-1" provider={Provider[provider as keyof typeof Provider]} />
                {capitalize(provider)}
              </div>
            </Option>
          ))}
        </Select>
      </label>

      <fieldset className="flex flex-col gap-3">
        <legend className="sr-only">API</legend>
        <label htmlFor="apiKey">
          <p className="font-medium text-foreground">API Key</p>
          <Input
            required
            className="mt-1 w-full"
            id="apiKey"
            name="apiKey"
            type="password"
            defaultValue={initialData?.apiKey}
          />
        </label>
        {/*<label className="-mt-1 flex items-start">
          <Checkbox
            name="custom-base-URL"
            checked={hasCustomBaseUrl}
            onCheckedChange={setHasCustomBaseUrl}
          />
          <span className="ml-2">Use custom base URL</span>
        </label>*/}
        <label className={cn('mt-2', !hasCustomBaseUrl && 'sr-only')}>
          <p className="font-medium text-foreground">Custom base URL</p>
          <Input
            className="mt-1 w-full"
            id="customBaseUrl"
            name="customBaseUrl"
            defaultValue={initialData?.customBaseUrl}
          />
        </label>
      </fieldset>

      <label>
        <p className="font-medium text-foreground">Model</p>
        {/* <Select
          className="mt-1 w-full"
          id="model"
          name="model"
          required
          defaultValue={initialData?.model || AnthropicModels.ClaudeSonnet}
        >
          {Object.values(AnthropicModels).map((model) => (
            <Option key={model} value={model}>
              <div className="flex gap-2">{capitalize(model)}</div>
            </Option>
          ))}
        </Select> */}
        <Input
            className="mt-1 w-full"
            id="model"
            name="model"
            required
            defaultValue={initialData?.model ?? AnthropicModels.ClaudeSonnet.toString()}
          />
      </label>

      <div className="space-y-1">
        <label htmlFor="temperature" className="text-sm font-medium text-foreground">
          Temperature
        </label>
        <div className="flex items-center gap-4">
          <Slider
            id="temperature"
            name="temperature"
            min={0}
            max={1}
            step={0.1}
            defaultValue={[initialData?.temperature ?? 0.2]}
            value={[initialData?.temperature ?? 0.2]}
            onValueChange={([value]: [number]) => {
              if (!initialData) return;
              const updatedPreset: Preset = {
                ...initialData,
                temperature: value,
                type: 'preset',
                provider: initialData.provider,
                permissions: initialData.permissions,
              };
              vscode.postMessage({
                type: 'update-preset',
                preset: updatedPreset
              });
            }}
          />
          <span className="w-12 text-sm text-description">
            {initialData?.temperature?.toFixed(1) ?? "0.2"}
          </span>
        </div>
        <p className="text-xs text-description">
          Controls randomness in responses. Lower values are more focused, higher values more creative.
        </p>
      </div>

      <label htmlFor="name">
        <p className="font-medium text-foreground">Preset name</p>
        <Input
          required
          className="mt-1 w-full"
          id="name"
          name="name"
          value={presetName}
          onChange={_onPresetNameChange}
        />
      </label>

      <label htmlFor="customInstructions" className="font-medium text-foreground">
        Custom instructions
        <Textarea
          className="mt-1 w-full"
          id="customInstructions"
          name="customInstructions"
          defaultValue={initialData?.customInstructions}
        />
      </label>
    </form>
  );
}
