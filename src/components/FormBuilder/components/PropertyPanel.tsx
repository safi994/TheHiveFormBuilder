import React from "react";
import { PropertyPanelProps } from "../types";

export const PropertyPanel: React.FC<PropertyPanelProps> = ({
  element,
  onUpdateProperty,
}) => {
  const renderPropertyInput = (key: string, value: any) => {
    switch (key) {
      case "rows":
      case "showInPreview":
      case "showInPDF":
        if (element.type === "spacer") {
          if (key === "rows") {
            return (
              <input
                type="number"
                min="0"
                max="10"
                value={value}
                onChange={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onUpdateProperty(element.i, key, Number(e.target.value));
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-full p-2 border rounded mt-1"
              />
            );
          } else {
            return (
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onUpdateProperty(element.i, key, e.target.checked);
                }}
                onClick={(e) => e.stopPropagation()}
                className="ml-2"
              />
            );
          }
        }
        return null;
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
        if (
          element.type === "checkbox" ||
          element.type === "select" ||
          element.type === "radio"
        ) {
          return (
            <div className="mt-2 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  One option per line
                </span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const sampleOptions = [
                      "Option 1",
                      "Option 2",
                      "Option 3",
                      "Option 4",
                      "Option 5",
                    ];
                    onUpdateProperty(element.i, "options", [
                      ...(Array.isArray(value) ? value : []),
                      ...sampleOptions,
                    ]);
                  }}
                  className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Add Sample Options
                </button>
              </div>
              <textarea
                value={Array.isArray(value) ? value.join("\n") : value || ""}
                onChange={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const options = e.target.value
                    .split("\n")
                    .map((opt) => opt.trim())
                    .filter(Boolean);
                  onUpdateProperty(element.i, "options", options);
                }}
                onClick={(e) => e.stopPropagation()}
                onFocus={(e) => e.stopPropagation()}
                className="w-full p-2 border rounded"
                placeholder="One option per line"
                rows={8}
                style={{ minHeight: "200px" }}
              />
            </div>
          );
        }
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
      className="bg-white p-4 rounded-lg shadow-sm border sticky top-4"
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
