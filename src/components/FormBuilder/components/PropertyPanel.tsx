import React from "react";
import { PropertyPanelProps } from "../types";

export const PropertyPanel: React.FC<PropertyPanelProps> = ({
  element,
  onUpdateProperty,
}) => {
  const renderPropertyInput = (key: string, value: any) => {
    switch (key) {
      case "required":
      case "multiple":
      case "defaultChecked":
        return (
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onUpdateProperty(element.i, key, e.target.checked);
            }}
            onClick={(e) => e.stopPropagation()}
            className="ml-2"
          />
        );
      case "options":
        return (
          <div className="mt-2">
            <textarea
              value={Array.isArray(value) ? value.join("\n") : ""}
              onChange={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onUpdateProperty(
                  element.i,
                  "options",
                  e.target.value.split("\n").filter(Boolean),
                );
              }}
              onClick={(e) => e.stopPropagation()}
              onFocus={(e) => e.stopPropagation()}
              className="w-full p-2 border rounded"
              placeholder="One option per line"
              rows={4}
            />
          </div>
        );
      default:
        return (
          <input
            type={typeof value === "number" ? "number" : "text"}
            value={value || ""}
            onChange={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onUpdateProperty(
                element.i,
                key,
                typeof value === "number"
                  ? Number(e.target.value)
                  : e.target.value,
              );
            }}
            onClick={(e) => e.stopPropagation()}
            onFocus={(e) => e.stopPropagation()}
            className="w-full p-2 border rounded mt-1"
          />
        );
    }
  };

  return (
    <div
      className="bg-gray-50 p-4 rounded-lg"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <h3 className="text-lg font-semibold mb-4">Properties</h3>
      {Object.entries(element.properties).map(([key, value]) => (
        <div
          key={key}
          className="mb-4"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <label className="block text-sm font-medium capitalize">
            {key.replace(/([A-Z])/g, " $1").trim()}
          </label>
          {renderPropertyInput(key, value)}
        </div>
      ))}
    </div>
  );
};
