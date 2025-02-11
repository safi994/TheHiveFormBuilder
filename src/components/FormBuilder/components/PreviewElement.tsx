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
    readOnly,
    isPreview,
  };

  // Map element types to their corresponding components
  const elementComponents = {
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
  };

  // Get the appropriate component based on element type
  const ElementComponent = elementComponents[element.type];

  if (!ElementComponent) {
    return <div>Unsupported element type</div>;
  }

  return <ElementComponent {...elementProps} />;
};
