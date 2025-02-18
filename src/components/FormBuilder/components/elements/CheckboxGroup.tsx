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
        : [{ text: properties.label?.text || "Option", key: "option-1" }]
      ).map((option, index) => {
        const optionText = typeof option === "object" ? option.text : option;
        const optionStyle =
          typeof option === "object"
            ? {
                fontSize: option.preview?.fontSize || option.fontSize || "14px",
                color:
                  option.preview?.textColor || option.textColor || "#000000",
                backgroundColor:
                  option.preview?.backgroundColor ||
                  option.backgroundColor ||
                  "transparent",
                fontWeight:
                  option.preview?.fontWeight || option.fontWeight || "normal",
                fontStyle:
                  option.preview?.fontStyle || option.fontStyle || "normal",
                textDecoration:
                  option.preview?.textDecoration ||
                  option.textDecoration ||
                  "none",
                lineHeight:
                  option.preview?.lineHeight || option.lineHeight || "1.5",
                letterSpacing:
                  option.preview?.letterSpacing ||
                  option.letterSpacing ||
                  "normal",
                padding: option.preview?.padding || option.padding || "0px",
                display: "inline-block",
                width: "100%",
                textAlign:
                  option.preview?.textAlign || option.textAlign || "left",
              }
            : {};
        const optionKey = typeof option === "object" ? option.key : option;
        return (
          <div key={index} className="flex items-center space-x-2">
            <Checkbox
              id={`${element.i}-${index}`}
              checked={
                Array.isArray(value) ? value[index] : index === 0 && value
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
              className="text-sm leading-none"
              style={optionStyle}
            >
              {optionText}
            </label>
          </div>
        );
      })}
    </div>
  );
};
