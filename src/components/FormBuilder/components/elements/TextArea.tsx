import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { FormElementProps } from "../../types";

/**
 * TextArea Component
 *
 * A form element that renders a multi-line text input with configurable properties.
 *
 * @param element - The form element configuration
 * @param value - The current value of the textarea
 * @param onChange - Callback function when value changes
 * @param readOnly - Whether the textarea is in read-only mode
 */
export const TextArea: React.FC<FormElementProps> = ({
  element,
  value,
  onChange,
  readOnly,
}) => {
  const { properties } = element;

  return (
    <Textarea
      value={value ?? properties.defaultValue ?? ""}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      disabled={readOnly}
      placeholder={properties.placeholder}
      required={properties.required}
      minLength={properties.minLength}
      maxLength={properties.maxLength}
      rows={properties.rows}
    />
  );
};
