import React from "react";
import { FormElement } from "../types";

export interface PreviewElementProps {
  element: FormElement;
  value?: any;
  onChange?: (value: any) => void;
}

export const PreviewElement: React.FC<PreviewElementProps> = ({
  element,
  value,
  onChange,
}) => {
  const { properties } = element;

  switch (element.type) {
    case "text":
      return (
        <input
          type="text"
          placeholder={properties.placeholder}
          value={value ?? properties.defaultValue}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          className="w-full p-2 border rounded"
          required={properties.required}
          minLength={properties.minLength}
          maxLength={properties.maxLength}
          pattern={properties.pattern}
        />
      );
    case "number":
      return (
        <input
          type="number"
          placeholder={properties.placeholder}
          value={value ?? properties.defaultValue}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          className="w-full p-2 border rounded"
          required={properties.required}
          min={properties.min}
          max={properties.max}
          step={properties.step}
        />
      );
    case "select":
      return (
        <select
          className="w-full p-2 border rounded"
          required={properties.required}
          multiple={properties.multiple}
          value={value ?? properties.defaultValue}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        >
          <option value="">Select an option...</option>
          {Array.isArray(properties.options) &&
            properties.options.map((option: string, i: number) => (
              <option key={i} value={option}>
                {option}
              </option>
            ))}
        </select>
      );
    case "checkbox":
      return (
        <div className="flex items-center">
          <input
            type="checkbox"
            className="mr-2"
            required={properties.required}
            checked={value ?? properties.defaultChecked}
            onChange={onChange ? (e) => onChange(e.target.checked) : undefined}
          />
          <span>{properties.label}</span>
        </div>
      );
    default:
      return <div>Unsupported element type</div>;
  }
};
