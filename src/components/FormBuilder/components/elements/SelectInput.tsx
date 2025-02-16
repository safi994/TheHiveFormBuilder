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
 * @param isPreview - Whether the component is in preview mode
 */
export const SelectInput: React.FC<FormElementProps> = ({
  element,
  value,
  onChange,
  readOnly,
  isPreview,
}) => {
  const { properties } = element;

  // Create custom style from element properties with default fallbacks
  const inputStyle = {
    borderColor: properties.inputBorderColor || "#d1d5db",
    borderRadius: properties.inputBorderRadius
      ? properties.inputBorderRadius + "px"
      : "0px",
    textAlign: properties.inputTextAlign || "left",
    padding: "8px",
    borderWidth: properties.inputBorderWidth
      ? properties.inputBorderWidth + "px"
      : "1px",
    borderStyle: "solid",
    width: "100%",
    fontSize: properties.inputFontSize
      ? properties.inputFontSize + "px"
      : "14px",
    fontStyle: properties.inputFontStyle || "normal",
    fontWeight: properties.inputFontWeight || "normal",
  };

  return (
    <Select
      value={value ?? properties.defaultValue ?? ""}
      onValueChange={!readOnly && onChange ? onChange : undefined}
      disabled={readOnly}
    >
      <SelectTrigger
        className="w-full border-0 bg-transparent focus:ring-0 focus:outline-none"
        style={{
          ...inputStyle,
          appearance: "none",
          WebkitAppearance: "none",
          MozAppearance: "none",
        }}
      >
        <div
          style={{
            textAlign: properties.inputTextAlign || "left",
            width: "100%",
          }}
        >
          <SelectValue placeholder="Select an option..." />
        </div>
      </SelectTrigger>
      <SelectContent
        style={{ position: "absolute", zIndex: isPreview ? 0 : -10 }}
      >
        {Array.isArray(properties.options) &&
          properties.options.map((option: any, i: number) => {
            const optionText =
              typeof option === "object" ? option.text : option;
            const optionKey = typeof option === "object" ? option.key : option;
            return (
              <SelectItem key={i} value={optionText}>
                {optionText}
              </SelectItem>
            );
          })}
      </SelectContent>
    </Select>
  );
};
