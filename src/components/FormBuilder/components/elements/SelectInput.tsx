import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormElementProps } from "../../types";

export const SelectInput: React.FC<FormElementProps> = ({
  element,
  value,
  onChange,
  readOnly,
  isPreview,
}) => {
  const { properties } = element;

  // Include color
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
    color: properties.inputFontColor || "#000000", // <-- THIS IS KEY
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
        // if you want the items to vanish in preview, you can keep zIndex at 0
        style={{ position: "absolute", zIndex: isPreview ? 0 : 9999 }}
      >
        {Array.isArray(properties.options) &&
          properties.options.map((option: any, i: number) => {
            const optionText =
              typeof option === "object" ? option.text : option;
            return (
              <SelectItem
                key={i}
                value={optionText}
                // Optionally set item text color:
                style={{ color: properties.inputFontColor || "#000000" }}
              >
                {optionText}
              </SelectItem>
            );
          })}
      </SelectContent>
    </Select>
  );
};
