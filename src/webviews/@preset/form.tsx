
import { VSCodeButton } from "vscode-elements/button";
import { VSCodeTextArea } from "vscode-elements/textarea";
import { Preset } from "../../model";


interface PresetFormProps extends React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> {
  initialData?: Preset
}

export function PresetForm(props: PresetFormProps) {
  const { initialData, ...rest } = props
  return (
    <form {...rest}>
      <VSCodeTextArea className="w-full" name="query" />
      <VSCodeButton type="submit">Send</VSCodeButton>
    </form>
  )
}