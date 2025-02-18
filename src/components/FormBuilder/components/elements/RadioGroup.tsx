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
            <RadioGroupItem value={optionText} id={`${element.i}-${index}`} />
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
    </RadixRadioGroup>
  );
};
