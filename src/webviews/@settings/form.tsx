import { PermissionState, Preset, Provider, ProviderType } from '../../model';
import * as React from 'react';
import { Checkbox } from 'components/checkbox';
import { Select, Option, SelectProps } from 'components/select';
import { Input } from 'components/input';
import { Textarea } from 'components/textarea';
import { cn } from 'utils/cn';
import { PresetLogo } from 'components/preset';
import { CheckedState } from '@radix-ui/react-checkbox';
import { capitalize } from 'utils/string';

interface PresetFormProps
  extends React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> {
  formId: string;
  initialData?: Preset;
  onPresetNameChange?: (name: string) => void;
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
    <form id={formId} className={cn(className, 'flex flex-col gap-4 text-description')} {...rest}>
      {initialData?.id && <input type="hidden" name="id" value={initialData?.id} />}
      <label htmlFor="provider">
        <p className="font-medium text-foreground">Provider</p>
        <Select
          className="mt-1 w-full"
          id="provider"
          name="provider"
          value={selectedProvider}
          onValueChange={onProviderChange}
        >
          {Object.values(Provider).map((provider) => (
            <Option key={provider} value={provider}>
              <div className="flex gap-2">
                <PresetLogo className="flex-shrink-0 translate-y-1" provider={provider} />
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
            className="mt-1 w-full"
            id="apiKey"
            name="apiKey"
            type="password"
            defaultValue={initialData?.apiKey}
          />
        </label>
        <label className="-mt-1 flex items-start">
          <Checkbox
            name="custom-base-URL"
            checked={hasCustomBaseUrl}
            onCheckedChange={setHasCustomBaseUrl}
          />
          <span className="ml-2">Use custom base URL</span>
        </label>
        <label className={cn(!hasCustomBaseUrl && 'sr-only', 'mt-2')}>
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
        <Input
          className="mt-1 w-full"
          id="model"
          name="model"
          type="model"
          defaultValue={initialData?.model}
        />
      </label>

      <fieldset>
        <legend className="font-medium text-foreground">Permissions</legend>
        <p className="text-description opacity-70">
          SotaSWE is smart, careful, and uses git to save changes - it works best with all
          permissions set to 'always'.
        </p>
        <ul className="mt-2 grid grid-cols-[auto,_min-content] text-description">
          <li className="contents">
            <label htmlFor="permissions.list-files">List files</label>
            <PermissionSelect
              className="w-full border-none"
              id="permissions.list-files"
              name="permissions[listFiles]"
              defaultValue={initialData?.permissions.listFiles || PermissionState.Always}
            />
          </li>
          <li className="contents">
            <label htmlFor="code-editing">Edit files</label>
            <PermissionSelect
              className="w-full border-none"
              id="write-code"
              name="permissions[codeEditing]"
              defaultValue={initialData?.permissions.codeEditing || PermissionState.Always}
            />
          </li>
          <li className="contents">
            <label htmlFor="permissions.terminal-commands">Run terminal commands</label>
            <PermissionSelect
              className="w-full border-none"
              id="permissions.terminal-commands"
              name="permissions[terminalCommands]"
              defaultValue={initialData?.permissions.terminalCommands || PermissionState.Always}
            />
          </li>
        </ul>
      </fieldset>

      <label htmlFor="name">
        <p className="font-medium text-foreground">Preset name</p>
        <Input
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

export function PermissionSelect(props: SelectProps) {
  return (
    <Select {...props}>
      {Object.values(PermissionState).map((ps) => (
        <Option key={ps} value={ps}>
          <div className="flex items-start gap-2">
            <span
              className={`codicon codicon-${getPermissionCodiconId(ps)} translate-y-0.5 text-description opacity-75`}
              aria-hidden
            />
            {ps}
          </div>
        </Option>
      ))}
    </Select>
  );
}

function getPermissionCodiconId(permissionState: PermissionState) {
  switch (permissionState) {
    case PermissionState.Always:
      return 'check-all';
    case PermissionState.Ask:
      return 'comment';
  }
}
