import React from "react";
import { PropertyPanelProps } from "../types";
import { Switch } from "@/components/ui/switch";
import { X } from "lucide-react";
import config from "../config";
import { TextEditor } from "./TextEditor/TextEditor";

export const PropertyPanel: React.FC<
  PropertyPanelProps & {
    onFormValueChange: (elementId: string, value: any) => void;
  }
> = ({ element, onUpdateProperty, onFormValueChange }) => {
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size
    if (
      element.properties.maxSize &&
      file.size > element.properties.maxSize * 1024 * 1024
    ) {
      alert(`Image size must be less than ${element.properties.maxSize}MB`);
      return;
    }

    // Create object URL for preview
    const url = URL.createObjectURL(file);
    const imageData = { file, url };
    // Update both the form value and the property
    onFormValueChange(element.i, imageData);
    onUpdateProperty(element.i, "image", imageData);
  };

  const renderPropertyInput = (key: string, value: any) => {
    // Special handling for image upload
    if (element.type === "image" && key === "image") {
      return (
        <div className="space-y-4">
          {value?.url && (
            <img
              src={value.url}
              alt="Preview"
              className="w-full h-auto rounded-lg"
              style={{ maxHeight: "200px", objectFit: "contain" }}
            />
          )}
          <div className="flex gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="property-image-upload"
            />
            <label
              htmlFor="property-image-upload"
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
            >
              Upload Image
            </label>
            {value?.url && (
              <button
                onClick={() => {
                  onFormValueChange(element.i, null);
                  onUpdateProperty(element.i, "image", null);
                }}
                className="px-4 py-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      );
    }

    // Special handling for text editor fields (plainText defaultText and labels)
    if (
      (element.type === "plainText" && key === "defaultText") ||
      key === "label"
    ) {
      return (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={typeof value === "object" ? value.text : value || ""}
            onChange={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const newValue =
                typeof value === "object"
                  ? {
                      ...value,
                      text: e.target.value,
                    }
                  : e.target.value;
              onUpdateProperty(element.i, key, newValue);
            }}
            onClick={(e) => e.stopPropagation()}
            onFocus={(e) => e.stopPropagation()}
            className="flex-1 p-2 border rounded mt-1"
            placeholder="Enter text or use editor for formatting"
          />
          <TextEditor
            value={typeof value === "object" ? value.text : value || ""}
            properties={typeof value === "object" ? value : element.properties}
            onChange={(newValue, newProperties) => {
              const updatedValue = {
                ...(typeof value === "object" ? value : {}),
                ...newProperties,
                text: newValue,
              };
              onUpdateProperty(element.i, key, updatedValue);
            }}
          />
        </div>
      );
    }
    switch (key) {
      case "labelSpacing":
        return (
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                min="0"
                max="48"
                value={value || 8}
                onChange={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onUpdateProperty(element.i, key, Number(e.target.value));
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-full p-2 pr-8 border rounded mt-1"
              />
              <span className="absolute right-3 top-[13px] text-sm text-gray-500">
                px
              </span>
            </div>
          </div>
        );
      case "rows":
        if (element.type === "spacer") {
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
        }
        return null;
      case "showInPreview":
      case "showInPDF":
        return (
          <Switch
            checked={value}
            onCheckedChange={(checked) => {
              onUpdateProperty(element.i, key, checked);
            }}
            className="mt-1"
          />
        );
      case "required":
      case "multiple":
      case "defaultChecked":
      case "showIndicators":
        return (
          <Switch
            checked={value || false}
            onCheckedChange={(checked) => {
              onUpdateProperty(element.i, key, checked);
            }}
            className="mt-1"
          />
        );
      case "options":
        if (
          element.type === "checkbox" ||
          element.type === "select" ||
          element.type === "radio"
        ) {
          // Ensure we always have at least 1 default option
          const options =
            Array.isArray(value) && value.length >= 1
              ? value
              : [{ text: "Option 1", key: "KEY-1" }];

          return (
            <div className="mt-2 space-y-4">
              <h3 className="text-xl font-semibold mb-6">
                {element.type.charAt(0).toUpperCase() + element.type.slice(1)}{" "}
                Options and Keys
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {options.map((option, index) => (
                  <div
                    key={index}
                    className="flex gap-2 items-start col-span-2"
                  >
                    <div className="flex-1">
                      <input
                        type="text"
                        value={
                          typeof option === "object" ? option.text : option
                        }
                        onChange={(e) => {
                          const newOptions = [...options];
                          if (typeof option === "object") {
                            newOptions[index] = {
                              ...option,
                              text: e.target.value,
                            };
                          } else {
                            newOptions[index] = {
                              text: e.target.value,
                              key: e.target.value,
                            };
                          }
                          onUpdateProperty(element.i, "options", newOptions);
                        }}
                        className="w-full p-2 border rounded"
                        placeholder="Option text"
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={typeof option === "object" ? option.key : option}
                        onChange={(e) => {
                          const newOptions = [...options];
                          if (typeof option === "object") {
                            newOptions[index] = {
                              ...option,
                              key: e.target.value,
                            };
                          } else {
                            newOptions[index] = {
                              text: option,
                              key: e.target.value,
                            };
                          }
                          onUpdateProperty(element.i, "options", newOptions);
                        }}
                        className="w-full p-2 border rounded"
                        placeholder="Option key"
                      />
                    </div>
                    <button
                      onClick={() => {
                        if (index === 0) {
                          // Reset first option to default
                          const newOptions = [...options];
                          newOptions[0] = { text: "Option 1", key: "KEY-1" };
                          onUpdateProperty(element.i, "options", newOptions);
                        } else {
                          // Delete other options
                          const newOptions = options.filter(
                            (_, i) => i !== index,
                          );
                          onUpdateProperty(element.i, "options", newOptions);
                        }
                      }}
                      className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  const newOptions = [
                    ...options,
                    { text: "New Option", key: "NEW-KEY" },
                  ];
                  onUpdateProperty(element.i, "options", newOptions);
                }}
                className="w-full p-2 border-2 border-dashed rounded-md hover:bg-gray-50 transition-colors text-gray-500 mt-4"
              >
                Add +
              </button>
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
      <h3 className="text-lg font-semibold mb-4">
        {config.settings.propertyPanel.title}
      </h3>
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
