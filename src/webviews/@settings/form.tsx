import { ANTHROPIC_MODELS, PermissionState, Preset, Provider } from "../../model";
import * as React from "react";
import { Checkbox } from "components/checkbox";
import { Select, Option, SelectProps } from "components/select";
import { Input } from "components/input";
import { Textarea } from "components/textarea";
import { Button } from "components/button";


interface PresetFormProps extends React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> {
  initialData?: Preset
}

export function PresetForm(props: PresetFormProps) {
  const { initialData, ...rest } = props

  const [didSetName, setDidSetName] = React.useState(false)

  return (
    <form {...rest} className="text-descriptionForeground">
      <label htmlFor="provider">
        Provider
        <Select className="w-full" id="provider" name="provider" defaultValue={initialData?.provider || Provider.Anthropic}>
          {Object.values(Provider).map((provider) => (
            <Option key={provider} value={provider}>{provider}</Option>
          ))}
        </Select>
      </label>

      <fieldset>
        <legend aria-hidden>API</legend>
        <label htmlFor="apiKey">
          APIKey
          <Input className="w-full" id="apiKey" name="apiKey" type="password" />
        </label>
        <label className="flex items-start">
          <Checkbox name="custom-base-URL" />
          <span className="ml-2">Use custom base URL</span>
        </label>
      </fieldset>

      <label>
        Model
        <Select className="w-full" name='model' defaultValue={initialData?.model || ANTHROPIC_MODELS[0]}>          {ANTHROPIC_MODELS.map((model) => (
          <Option key={model} value={model}>{model}</Option>
        ))}
        </Select>
      </label>

      <fieldset>
        <legend>Permissions</legend>
        <p>SotaSWE is smart, careful, and uses git to save changes - it works best with all permissions set to 'always'.</p>
        <ul className="grid grid-cols-[auto,_1fr]">
          <li className="contents">
            <label htmlFor="permissions.list-files">
              List files
            </label>
            <PermissionSelect className="w-full border-none" id="permissions.list-files" name="permissions[list-files]" />
          </li>
          <li className="contents">
            <label htmlFor="code-editing">
              Edit files
            </label>
            <PermissionSelect className="w-full border-none" id="write-code" name="permissions[code-editing]" />
          </li>
          <li className="contents">
            <label htmlFor="permissions.terminal-commands">
              Run terminal commands
            </label>
            <PermissionSelect className="w-full border-none" id="permissions.terminal-commands" name="permissions[terminal-commands]" />
          </li>
        </ul>
      </fieldset>

      <label htmlFor="name">
        Preset name
        <Input className="w-full" id="name" name="name" />
      </label>


      <label htmlFor="customInstructions">
        Custom instructions
        <Textarea className="w-full" id='customInstructions' name="customInstructions" />
      </label>

      <Button type="submit">Send</Button>
    </form>
  )
}

export function PermissionSelect(props: SelectProps) {
  return (
    <Select {...props} defaultValue={PermissionState.Always}>
      {Object.values(PermissionState).map((ps) => (
        <Option key={ps} value={ps}>{ps}</Option>
      ))}
    </Select>
  )
}