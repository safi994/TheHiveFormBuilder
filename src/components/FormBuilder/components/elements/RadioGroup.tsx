import React from "react";
import {
  RadioGroup as RadixRadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { FormElementProps } from "../../types";

/**
 * RadioGroup Component
 *
 * A form element that renders a group of radio buttons with configurable options.
 *
 * @param element - The form element configuration
 * @param value - The currently selected option
 * @param onChange - Callback function when selection changes
 * @param readOnly - Whether the radio buttons are in read-only mode
 */
export const RadioGroup: React.FC<FormElementProps> = ({
  element,
  value,
  onChange,
  readOnly,
}) => {
  const { properties } = element;

  return (
    <RadixRadioGroup
      value={value}
      onValueChange={!readOnly && onChange ? onChange : undefined}
      disabled={readOnly}
    >
      {(Array.isArray(properties.options) && properties.options.length > 0
        ? properties.options
        : [properties.label]
      ).map((option, index) => (
        <div key={index} className="flex items-center space-x-2">
          <RadioGroupItem value={option} id={`${element.i}-${index}`} />
          <label
            htmlFor={`${element.i}-${index}`}
            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {option}
          </label>
        </div>
      ))}
    </RadixRadioGroup>
  );
};
