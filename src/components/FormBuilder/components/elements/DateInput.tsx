import React from "react";
import { Input } from "@/components/ui/input";
import { FormElementProps } from "../../types";

/**
 * DateInput Component
 *
 * A form element that renders a date input field with configurable properties.
 *
 * @param element - The form element configuration
 * @param value - The current date value
 * @param onChange - Callback function when date changes
 * @param readOnly - Whether the input is in read-only mode
 */
export const DateInput: React.FC<FormElementProps> = ({
  element,
  value,
  onChange,
  readOnly,
}) => {
  const { properties } = element;

  return (
    <Input
      type="date"
      value={value ?? properties.defaultValue ?? ""}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      disabled={readOnly}
      required={properties.required}
      min={properties.min}
      max={properties.max}
    />
  );
};
