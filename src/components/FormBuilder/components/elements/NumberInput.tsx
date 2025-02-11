import React from "react";
import { Input } from "@/components/ui/input";
import { FormElementProps } from "../../types";

/**
 * NumberInput Component
 *
 * A form element that renders a number input field with configurable properties.
 *
 * @param element - The form element configuration
 * @param value - The current numeric value
 * @param onChange - Callback function when value changes
 * @param readOnly - Whether the input is in read-only mode
 */
export const NumberInput: React.FC<FormElementProps> = ({
  element,
  value,
  onChange,
  readOnly,
}) => {
  const { properties } = element;

  return (
    <Input
      type="number"
      value={value ?? properties.defaultValue ?? ""}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      disabled={readOnly}
      placeholder={properties.placeholder}
      required={properties.required}
      min={properties.min}
      max={properties.max}
      step={properties.step}
    />
  );
};
