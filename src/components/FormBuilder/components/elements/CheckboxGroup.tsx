import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { FormElementProps } from "../../types";

/**
 * CheckboxGroup Component
 *
 * A form element that renders a group of checkboxes with configurable options.
 *
 * @param element - The form element configuration
 * @param value - Array of boolean values indicating checked state of each option
 * @param onChange - Callback function when any checkbox state changes
 * @param readOnly - Whether the checkboxes are in read-only mode
 */
export const CheckboxGroup: React.FC<FormElementProps> = ({
  element,
  value,
  onChange,
  readOnly,
}) => {
  const { properties } = element;

  return (
    <div className="space-y-2">
      {(Array.isArray(properties.options) && properties.options.length > 0
        ? properties.options
        : [properties.label]
      ).map((option, index) => (
        <div key={index} className="flex items-center space-x-2">
          <Checkbox
            id={`${element.i}-${index}`}
            checked={
              Array.isArray(value) ? value[index] : index === 0 ? value : false
            }
            onCheckedChange={
              !readOnly && onChange
                ? (checked) => {
                    const newValues = Array.isArray(value)
                      ? [...(value || [])]
                      : [];
                    newValues[index] = checked;
                    onChange(newValues);
                  }
                : undefined
            }
            disabled={readOnly}
          />
          <label
            htmlFor={`${element.i}-${index}`}
            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {option}
          </label>
        </div>
      ))}
    </div>
  );
};
