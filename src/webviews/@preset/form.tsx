
import { VSCodeButton } from "vscode-elements/button";
import { VSCodeTextArea } from "vscode-elements/textarea";
import { Preset, Provider } from "../../model";
import { VSCodeFormContainer, VSCodeFormContainerProps } from "vscode-elements/form-container";
import { VSCodeFormGroup } from "vscode-elements/form-group";
import { VSCodeLabel } from "vscode-elements/label";
import { VSCodeSingleSelect } from "vscode-elements/single-select";
import { VSCodeOption } from "vscode-elements/option";


interface PresetFormProps extends VSCodeFormContainerProps {
  initialData?: Preset
}

export function PresetForm(props: PresetFormProps) {
  const { initialData, ...rest } = props
  return (
    <VSCodeFormContainer {...rest}>

        <VSCodeLabel>
          Provider
        </VSCodeLabel>
        <VSCodeSingleSelect>
        {Object.values(Provider).map((provider) => (
          <VSCodeOption key={provider}>{provider}</VSCodeOption> 
        ))}
        </VSCodeSingleSelect>

      <VSCodeTextArea className="w-full" name="query" />

      <VSCodeButton type="submit">Send</VSCodeButton>
    </VSCodeFormContainer>
  )
}