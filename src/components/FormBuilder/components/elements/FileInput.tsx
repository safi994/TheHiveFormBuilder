import React from "react";
import { Input } from "@/components/ui/input";
import { FormElementProps } from "../../types";

/**
 * FileInput Component
 *
 * A form element that renders a file input field with configurable properties.
 *
 * @param element - The form element configuration
 * @param value - The current file value
 * @param onChange - Callback function when file selection changes
 * @param readOnly - Whether the input is in read-only mode
 */
export const FileInput: React.FC<FormElementProps> = ({
  element,
  value,
  onChange,
  readOnly,
}) => {
  const { properties } = element;

  if (readOnly) {
    return (
      <div className="w-full p-2 border rounded-md bg-muted">
        {value?.name || "No file selected"}
      </div>
    );
  }

  return (
    <Input
      type="file"
      onChange={onChange ? (e) => onChange(e.target.files?.[0]) : undefined}
      disabled={readOnly}
      required={properties.required}
      accept={properties.accept}
      multiple={properties.multiple}
    />
  );
};
