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
        <div className="space-y-2">
          {(Array.isArray(properties.options) && properties.options.length > 0
            ? properties.options
            : [properties.label]
          ).map((option, index) => (
            <div key={index} className="flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                required={properties.required}
                checked={
                  Array.isArray(value)
                    ? value[index]
                    : index === 0
                      ? value
                      : false
                }
                onChange={
                  onChange
                    ? (e) => {
                        const newValues = Array.isArray(value)
                          ? [...value]
                          : [];
                        newValues[index] = e.target.checked;
                        onChange(newValues);
                      }
                    : undefined
                }
              />
              <span>{option}</span>
            </div>
          ))}
        </div>
      );
    case "radio":
      return (
        <div className="space-y-2">
          {(Array.isArray(properties.options) && properties.options.length > 0
            ? properties.options
            : [properties.label]
          ).map((option, index) => (
            <div key={index} className="flex items-center">
              <input
                type="radio"
                name={element.i}
                className="mr-2"
                required={properties.required}
                checked={value === option}
                onChange={onChange ? () => onChange(option) : undefined}
              />
              <span>{option}</span>
            </div>
          ))}
        </div>
      );
    default:
      return <div>Unsupported element type</div>;
  }
};
