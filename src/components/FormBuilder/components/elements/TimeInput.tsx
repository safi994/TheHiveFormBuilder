import React from "react";
import { Input } from "@/components/ui/input";
import { FormElementProps } from "../../types";

/**
 * TimeInput Component
 *
 * A form element that renders a time input field with configurable properties.
 *
 * @param element - The form element configuration
 * @param value - The current time value
 * @param onChange - Callback function when time changes
 * @param readOnly - Whether the input is in read-only mode
 */
export const TimeInput: React.FC<FormElementProps> = ({
  element,
  value,
  onChange,
  readOnly,
}) => {
  const { properties } = element;

  return (
    <Input
      type="time"
      value={value ?? properties.defaultValue ?? ""}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      disabled={readOnly}
      required={properties.required}
      min={properties.min}
      max={properties.max}
    />
  );
};
