import { ANTHROPIC_MODELS, PermissionState, Preset, Provider, View } from '../../model';
import * as React from 'react';
import { Checkbox } from 'components/checkbox';
import { Select, Option, SelectProps } from 'components/select';
import { Input } from 'components/input';
import { Textarea } from 'components/textarea';
import { cn } from 'utils/cn';

interface PresetFormProps
  extends React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> {
  formId: string;
  initialData?: Preset;
}

export function PresetForm(props: PresetFormProps) {
  const { className, formId, initialData, ...rest } = props;

  console.log('initialData', initialData);

  return (
    <form id={formId} className={cn(className, 'flex flex-col gap-2 text-description')} {...rest}>
      {initialData?.id && <input type="hidden" name="id" value={initialData?.id} />}
      <label htmlFor="provider">
        Provider
        <Select
          className="w-full"
          id="provider"
          name="provider"
          defaultValue={initialData?.provider || Provider.Anthropic}
        >
          {Object.values(Provider).map((provider) => (
            <Option key={provider} value={provider}>
              {provider}
            </Option>
          ))}
        </Select>
      </label>

      <fieldset>
        <legend className="sr-only">API</legend>
        <label htmlFor="apiKey" className="font-medium text-foreground">
          APIKey
          <Input
            className="mt-1 w-full"
            id="apiKey"
            name="apiKey"
            type="password"
            defaultValue={initialData?.apiKey}
          />
        </label>
        <label className="flex items-start">
          <Checkbox name="custom-base-URL" />
          <span className="ml-2">Use custom base URL</span>
        </label>
      </fieldset>

      <label>
        Model
        <Select
          className="w-full"
          name="model"
          defaultValue={initialData?.model || ANTHROPIC_MODELS[0]}
        >
          {ANTHROPIC_MODELS.map((model) => (
            <Option key={model} value={model}>
              {model}
            </Option>
          ))}
        </Select>
      </label>

      <fieldset>
        <legend>Permissions</legend>
        <p>
          SotaSWE is smart, careful, and uses git to save changes - it works best with all
          permissions set to 'always'.
        </p>
        <ul className="grid grid-cols-[auto,_1fr]">
          <li className="contents">
            <label htmlFor="permissions.list-files">List files</label>
            <PermissionSelect
              className="w-full border-none"
              id="permissions.list-files"
              name="permissions[listFiles]"
              defaultValue={initialData?.permissions.listFiles}
            />
          </li>
          <li className="contents">
            <label htmlFor="code-editing">Edit files</label>
            <PermissionSelect
              className="w-full border-none"
              id="write-code"
              name="permissions[codeEditing]"
              defaultValue={initialData?.permissions.codeEditing}
            />
          </li>
          <li className="contents">
            <label htmlFor="permissions.terminal-commands">Run terminal commands</label>
            <PermissionSelect
              className="w-full border-none"
              id="permissions.terminal-commands"
              name="permissions[terminalCommands]"
              defaultValue={initialData?.permissions.terminalCommands}
            />
          </li>
        </ul>
      </fieldset>

      <label htmlFor="name">
        Preset name
        <Input className="w-full" id="name" name="name" defaultValue={initialData?.name} />
      </label>

      <label htmlFor="customInstructions">
        Custom instructions
        <Textarea
          className="w-full"
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
          {ps}
        </Option>
      ))}
    </Select>
  );
}
