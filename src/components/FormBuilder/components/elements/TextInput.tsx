import React from "react";
import { Input } from "@/components/ui/input";
import { FormElementProps } from "../../types";

/**
 * TextInput Component
 *
 * A form element that renders a text input field with configurable properties.
 *
 * @param element - The form element configuration
 * @param value - The current value of the input
 * @param onChange - Callback function when value changes
 * @param readOnly - Whether the input is in read-only mode
 */
export const TextInput: React.FC<FormElementProps> = ({
  element,
  value,
  onChange,
  readOnly,
}) => {
  const { properties } = element;

  return (
    <Input
      type="text"
      value={value ?? properties.defaultValue ?? ""}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      disabled={readOnly}
      placeholder={properties.placeholder}
      required={properties.required}
      minLength={properties.minLength}
      maxLength={properties.maxLength}
      pattern={properties.pattern}
    />
  );
};
