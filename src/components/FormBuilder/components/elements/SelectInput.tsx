import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormElementProps } from "../../types";

/**
 * SelectInput Component
 *
 * A form element that renders a dropdown select with configurable options.
 *
 * @param element - The form element configuration
 * @param value - The current selected value
 * @param onChange - Callback function when selection changes
 * @param readOnly - Whether the select is in read-only mode
 */
export const SelectInput: React.FC<FormElementProps> = ({
  element,
  value,
  onChange,
  readOnly,
}) => {
  const { properties } = element;

  return (
    <Select
      value={value ?? properties.defaultValue ?? ""}
      onValueChange={!readOnly && onChange ? onChange : undefined}
      disabled={readOnly}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select an option..." />
      </SelectTrigger>
      <SelectContent>
        {Array.isArray(properties.options) &&
          properties.options.map((option: string, i: number) => (
            <SelectItem key={i} value={option}>
              {option}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );
};
