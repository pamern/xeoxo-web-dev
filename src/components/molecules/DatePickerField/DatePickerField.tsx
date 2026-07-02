import { type InputHTMLAttributes } from "react";
import { TextField } from "@/components/molecules/TextField";

export interface DatePickerFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function DatePickerField(props: DatePickerFieldProps) {
  return <TextField type="date" {...props} />;
}
