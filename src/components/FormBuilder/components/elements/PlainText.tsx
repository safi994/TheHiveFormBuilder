import React from "react";
import { FormElementProps } from "../../types";
import { cn } from "@/lib/utils";

export const PlainText: React.FC<FormElementProps> = ({
  element,
  value,
  onChange,
  readOnly,
}) => {
  const { properties } = element;

  const textStyles = {
    fontSize: properties.fontSize,
    color: properties.textColor,
    backgroundColor: properties.backgroundColor,
    fontWeight: properties.fontWeight,
    fontStyle: properties.fontStyle,
    textAlign: properties.textAlign as "left" | "center" | "right" | "justify",
    textDecoration: properties.textDecoration,
    lineHeight: properties.lineHeight,
    letterSpacing: properties.letterSpacing,
    padding: properties.padding,
  };

  if (readOnly) {
    return (
      <div
        className={cn("w-full break-words", properties.className)}
        style={textStyles}
      >
        {value || properties.defaultText}
      </div>
    );
  }

  return (
    <div
      contentEditable={!readOnly}
      onBlur={(e) => onChange?.(e.target.textContent)}
      className={cn(
        "w-full break-words outline-none focus:ring-2 focus:ring-blue-500 rounded",
        properties.className,
      )}
      style={textStyles}
      suppressContentEditableWarning
    >
      {value || properties.defaultText}
    </div>
  );
};
