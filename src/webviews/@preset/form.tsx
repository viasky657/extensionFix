
import { VSCodeButton } from "vscode-elements/button";
import { VSCodeTextArea } from "vscode-elements/textarea";
import { ANTHROPIC_MODELS, PermissionState, Preset, Provider } from "../../model";
import { VSCodeLabel } from "vscode-elements/label";
import { VSCodeSingleSelect, VSCodeSingleSelectProps } from "vscode-elements/single-select";
import { VSCodeOption } from "vscode-elements/option";
import { VSCodeTextfield } from "vscode-elements/text-field";
import * as React from "react";
import { Checkbox, CheckboxInput } from "components/checkbox";


interface PresetFormProps extends React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> {
  initialData?: Preset
}

export function PresetForm(props: PresetFormProps) {
  const { initialData, ...rest } = props

  const [didSetName, setDidSetName] = React.useState(false)

  return (
    <form {...rest}>
      <VSCodeLabel htmlFor="provider">
        Provider
      </VSCodeLabel>
      <VSCodeSingleSelect id="provider" name="provider" className="w-full">
        {Object.values(Provider).map((provider) => (
          <VSCodeOption key={provider}>{provider}</VSCodeOption>
        ))}
      </VSCodeSingleSelect>

      <fieldset>
        <VSCodeLabel htmlFor="api-key">
          APIKey
        </VSCodeLabel>
        <VSCodeTextfield className="w-full" id="api-key" name="api-key" type="password" />
        <Checkbox>
          <CheckboxInput name="custom-base-URL" />
          Use custom base URL
        </Checkbox>
      </fieldset>



      <VSCodeLabel>
        Model
      </VSCodeLabel>
      <VSCodeSingleSelect className="w-full">
        {ANTHROPIC_MODELS.map((model) => (
          <VSCodeOption key={model}>{model}</VSCodeOption>
        ))}
      </VSCodeSingleSelect>

      <fieldset>
        <legend>Permissions</legend>
        <p>SōtaPR is smart, careful, and uses git to save changes - it works best with all permissions set to 'always'.</p>
        <ul>
          <li>
            <label htmlFor="code-editing">
              Code editing
            </label>
            <PermissionSelect className="w-full" id="write-code" name="permissions[code-editing]" />
          </li>
          <li>
            <label htmlFor="permissions.terminal-commands">
              Run terminal commands
            </label>
            <PermissionSelect className="w-full" id="permissions.terminal-commands" name="permissions[terminal-commands]" />
          </li>
          <li>
            <label htmlFor="permissions.list-files">
              List files
            </label>
            <PermissionSelect className="w-full" id="permissions.list-files" name="permissions[list-files]" />
          </li>
          <li>
            <label htmlFor="permissions.search-file-content-with-regex">
              Search file content with regex
            </label>
            <PermissionSelect className="w-full" id="permissions.search-file-content-with-regex" name="permissions[search-file-content-with-regex]" />
          </li>
          <li>
            <label htmlFor="permissions.open-files">
              Open files
            </label>
            <PermissionSelect className="w-full" id="permissions.oapen-files" name="permissions[open-files]" />
          </li>
          <li>
            <label htmlFor="permissions.lsp-diagnostics">
              Use LSP diagnostics
            </label>
            <PermissionSelect className="w-full" id="permissions.lsp-diagnostics" name="permissions[lsp-diagnostics]" />
          </li>
          <li>
            <label htmlFor="permissions.followup-questions">
              Ask followup questions
            </label>
            <PermissionSelect className="w-full" id="permissions.followup-questions" name="permissions[followup-questions]" />
          </li>
        </ul>
      </fieldset>

      <VSCodeLabel htmlFor="name">
        Preset name
      </VSCodeLabel>
      <VSCodeTextfield className="w-full" id="name" name="name" />

      <VSCodeLabel htmlFor="custom-instructions">
        Custom instructions
      </VSCodeLabel>
      <VSCodeTextArea className="w-full" id='custom-instructions' name="custom-instructions" />

      <VSCodeButton type="submit">Send</VSCodeButton>
    </form>
  )
}

export function PermissionSelect(props: VSCodeSingleSelectProps) {
  return (
    <select {...props}>
      {Object.values(PermissionState).map((ps) => (
        <option key={ps}>{ps}</option>
      ))}
    </select>
  )
}