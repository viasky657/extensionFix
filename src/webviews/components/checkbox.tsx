import { cn } from "utils/cn"


export interface CheckboxProps extends React.DetailedHTMLProps<React.LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement> { }

export function Checkbox(props: CheckboxProps) {
  const { children, className, ...rest } = props
  return <label className={cn('text-settings-checkboxForeground')} {...rest}>
    {children}
  </label>
}

export interface CheckboxInputProps extends React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> { }

export function CheckboxInput(props: CheckboxInputProps) {
  const { className, ...rest } = props
  return <input type="checkbox" className={cn(className, "bg-settings-checkboxBackground border rounded-sm border-settings-checkboxBorder")} {...rest} />
}
