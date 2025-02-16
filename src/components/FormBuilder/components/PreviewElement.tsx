import React from "react";
import { PreviewElementProps } from "../types";
import {
  TextInput,
  TextArea,
  SelectInput,
  CheckboxGroup,
  RadioGroup,
  DateInput,
  TimeInput,
  FileInput,
  NumberInput,
  Spacer,
  ToggleSwitch,
  PlainText,
  ImageUpload,
  Table,
} from "./elements";

/**
 * PreviewElement Component
 *
 * A wrapper component that renders the appropriate form element based on the element type.
 * It handles the routing of props to the specific element component and provides
 * a consistent interface for all form elements.
 *
 * @param element - The form element configuration
 * @param value - The current value of the element
 * @param onChange - Callback function when value changes
 * @param isPreview - Whether the element is being rendered in preview mode
 * @param readOnly - Whether the element is in read-only mode
 */
export const PreviewElement: React.FC<PreviewElementProps> = ({
  element,
  value,
  onChange,
  isPreview = false,
  readOnly = false,
}) => {
  const elementProps = {
    element,
    value,
    onChange,
    readOnly: element.type === "select" ? false : readOnly,
    isPreview,
  };

  // Inserted renderLabel function before any conditional rendering
  const renderLabel = () => {
    if (element.type === "spacer" || !isPreview) return null;
    const labelProps = element.properties.label;
    if (!labelProps) return null;
    const labelText =
      typeof labelProps === "object" ? labelProps.text : labelProps;
    if (!labelText) return null;
    const labelStyle =
      typeof labelProps === "object"
        ? {
            ...(labelProps.preview || labelProps),
            fontSize:
              labelProps.preview?.fontSize || labelProps.fontSize || "14px",
            color:
              labelProps.preview?.textColor ||
              labelProps.textColor ||
              "#000000",
            backgroundColor:
              labelProps.preview?.backgroundColor ||
              labelProps.backgroundColor ||
              "transparent",
            fontWeight:
              labelProps.preview?.fontWeight ||
              labelProps.fontWeight ||
              "normal",
            fontStyle:
              labelProps.preview?.fontStyle || labelProps.fontStyle || "normal",
            textDecoration:
              labelProps.preview?.textDecoration ||
              labelProps.textDecoration ||
              "none",
            lineHeight:
              labelProps.preview?.lineHeight || labelProps.lineHeight || "1.5",
            letterSpacing:
              labelProps.preview?.letterSpacing ||
              labelProps.letterSpacing ||
              "normal",
            padding: labelProps.preview?.padding || labelProps.padding || "0px",
            display: "inline-block",
            width: "100%",
            textAlign:
              labelProps.preview?.textAlign || labelProps.textAlign || "left",
          }
        : {};

    return (
      <div style={{ textAlign: element.properties.label?.textAlign || "left" }}>
        <span style={{ ...labelStyle }}>
          {labelText}
          {element.properties.required && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </span>
      </div>
    );
  };

  // New conditional block for input elements that maintains container width and shows label
  if (["text", "textarea", "number", "date", "time"].includes(element.type)) {
    const inputStyle = {
      borderColor: element.properties.inputBorderColor || "#d1d5db",
      borderRadius: element.properties.inputBorderRadius
        ? element.properties.inputBorderRadius + "px"
        : "0px",
      textAlign: element.properties.inputTextAlign || "left",
      padding: "8px",
      borderWidth: element.properties.inputBorderWidth
        ? element.properties.inputBorderWidth + "px"
        : "1px",
      borderStyle: element.properties.inputBorderStyle || "solid",
      width: "100%",
      fontSize: element.properties.inputFontSize
        ? element.properties.inputFontSize + "px"
        : "14px",
      fontStyle: element.properties.inputFontStyle || "normal",
      fontWeight: element.properties.inputFontWeight || "normal",
      color: element.properties.inputFontColor || "#000000",
      ...(element.type !== "textarea" && element.properties.inputHeight
        ? { height: element.properties.inputHeight + "px" }
        : {}),
    };

    const isTableCell = element.i && element.i.includes("-");
    const containerWidth = isTableCell
      ? "100%"
      : (element as any)?.style?.size
        ? `${((element as any).style.size / 12) * 100}%`
        : "100%";

    const derivedInputType = (() => {
      if (element.type === "number") return "number";
      if (element.type === "date") return "date";
      if (element.type === "time") return "time";
      return "text";
    })();

    return (
      <div style={{ width: containerWidth }}>
        {renderLabel()}
        <div style={{ marginTop: `${element.properties.labelSpacing || 8}px` }}>
          {element.type === "textarea" ? (
            <textarea
              value={value || ""}
              onChange={(e) => onChange && onChange(e.target.value)}
              style={{
                ...inputStyle,
                width: "100%",
                minHeight: "60px",
                resize: "vertical",
              }}
              readOnly={readOnly}
            />
          ) : (
            <input
              type={derivedInputType}
              value={value || ""}
              onChange={(e) => onChange && onChange(e.target.value)}
              style={inputStyle}
              readOnly={
                derivedInputType === "date" || derivedInputType === "time"
                  ? false
                  : readOnly
              }
            />
          )}
        </div>
      </div>
    );
  }

  // Map element types to their corresponding components
  const elementComponents = {
    plainText: PlainText,
    toggle: ToggleSwitch,
    spacer: Spacer,
    text: TextInput,
    textarea: TextArea,
    number: NumberInput,
    select: SelectInput,
    checkbox: CheckboxGroup,
    radio: RadioGroup,
    date: DateInput,
    time: TimeInput,
    file: FileInput,
    image: ImageUpload,
    table: Table,
    pageBreak: () => (
      <div className="w-full flex items-center gap-4">
        <div className="flex-1 h-px bg-gray-300" />
        <span className="text-gray-500 font-bold">Page Break</span>
        <div className="flex-1 h-px bg-gray-300" />
      </div>
    ),
  };

  // Get the appropriate component based on element type
  const ElementComponent = elementComponents[element.type];

  if (!ElementComponent) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[40px] text-gray-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" />
          <path d="M3 9h18" />
          <path d="M9 21V9" />
        </svg>
      </div>
    );
  }

  // For plain text elements, don't show label since the text is the content itself
  if (element.type === "plainText") {
    return <ElementComponent {...elementProps} />;
  }

  return (
    <div className="w-full">
      {renderLabel()}
      <div
        style={{
          marginTop: `${element.properties.labelSpacing || 8}px`,
          ...(element.type === "select"
            ? {
                position: "relative",
                zIndex: isPreview ? 0 : 1000,
                overflow: "visible",
              }
            : {}),
        }}
      >
        <ElementComponent {...elementProps} />
      </div>
    </div>
  );
};
