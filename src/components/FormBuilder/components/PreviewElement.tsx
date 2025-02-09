import React from "react";
import { PreviewElementProps } from "../types";

export const PreviewElement: React.FC<PreviewElementProps> = ({ element }) => {
  const { properties } = element;

  switch (element.type) {
    case "text":
      return (
        <input
          type="text"
          placeholder={properties.placeholder}
          defaultValue={properties.defaultValue}
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
          defaultValue={properties.defaultValue}
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
          defaultValue={properties.defaultValue}
        >
          {properties.options.map((option: string, i: number) => (
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
            defaultChecked={properties.defaultChecked}
          />
          <span>{properties.label}</span>
        </div>
      );
    default:
      return <div>Unsupported element type</div>;
  }
};
