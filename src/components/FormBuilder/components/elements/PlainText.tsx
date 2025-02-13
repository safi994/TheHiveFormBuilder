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

  const textContent = React.useMemo(() => {
    if (value) return value;
    if (!properties.defaultText) return "";
    return typeof properties.defaultText === "object"
      ? properties.defaultText.text
      : properties.defaultText;
  }, [value, properties.defaultText]);

  const textStyles = React.useMemo(() => {
    const defaultText = properties.defaultText;
    if (!defaultText || typeof defaultText !== "object") return {};

    // Use preview styles by default
    const styles = defaultText.preview || defaultText;

    return {
      fontSize: styles.fontSize || "16px",
      color: styles.textColor || "#000000",
      backgroundColor: styles.backgroundColor || "transparent",
      fontWeight: styles.fontWeight || "normal",
      fontStyle: styles.fontStyle || "normal",
      textAlign: (styles.textAlign || "left") as
        | "left"
        | "center"
        | "right"
        | "justify",
      textDecoration: styles.textDecoration || "none",
      lineHeight: styles.lineHeight || "1.5",
      letterSpacing: styles.letterSpacing || "normal",
      padding: styles.padding || "0px",
    };
  }, [properties]);

  return (
    <div
      className={cn("w-full break-words", properties.className)}
      style={textStyles}
    >
      {textContent}
    </div>
  );
};
