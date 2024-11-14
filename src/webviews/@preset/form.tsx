
import { VSCodeButton } from "vscode-elements/button";
import { VSCodeTextArea } from "vscode-elements/textarea";
import { PermissionState, Preset, Provider } from "../../model";
import { VSCodeLabel } from "vscode-elements/label";
import { VSCodeSingleSelect, VSCodeSingleSelectProps } from "vscode-elements/single-select";
import { VSCodeOption } from "vscode-elements/option";
import { VSCodeTextfield } from "vscode-elements/text-field";
import * as React from "react";


interface PresetFormProps extends React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> {
  initialData?: Preset
}

export function PresetForm(props: PresetFormProps) {
  const { initialData, ...rest } = props

  const [didSetName, setDidSetName] = React.useState(false)

  function onChange() {
    console.log('hi');
  }
  

  return (
    <form onChange={onChange} {...rest}>
        <VSCodeLabel htmlFor="provider">
          Provider
        </VSCodeLabel>
        <VSCodeSingleSelect id="provider" name="provider" className="w-full">
          {Object.values(Provider).map((provider) => (
            <VSCodeOption key={provider}>{provider}</VSCodeOption> 
          ))}
        </VSCodeSingleSelect>
       

        <VSCodeLabel htmlFor="api-key">
          APIKey
        </VSCodeLabel>
        <VSCodeTextfield className="w-full" id="api-key" name="api-key" type="password" />

        <VSCodeLabel>
          Provider
        </VSCodeLabel>
        <VSCodeSingleSelect className="w-full">
        {Object.values(Provider).map((provider) => (
          <VSCodeOption key={provider}>{provider}</VSCodeOption> 
        ))}
        </VSCodeSingleSelect>

        <VSCodeLabel htmlFor="custom-instructions">
          Custom instructions
        </VSCodeLabel>
        <VSCodeTextArea className="w-full" id='custom-instructions' name="custom-instructions" />

        <VSCodeLabel htmlFor="name">
          Preset name
        </VSCodeLabel>
        <VSCodeTextfield className="w-full" id="name" name="name" />

        <fieldset>
          <legend>Permissions</legend>
          <p>SōtaPR is smart, careful, and uses git to save changes - it works best with all permissions set to 'always'.</p>
          <ul>
            <li>
              <label htmlFor="readonly-">
                Write code
              </label>
              <PermissionSelect className="w-full" id="write-code" name="write-code" />
            </li>
          </ul>
        </fieldset>
        

      <VSCodeButton type="submit">Send</VSCodeButton>
    </form>
  )
}

export function PermissionSelect(props: VSCodeSingleSelectProps) {
  return ( 
    <VSCodeSingleSelect {...props}>
    {Object.values(PermissionState).map((ps) => (
      <VSCodeOption key={ps}>{ps}</VSCodeOption> 
    ))}
    </VSCodeSingleSelect>
  )
}