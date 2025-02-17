import React, { useState } from "react";
import { FormElement } from "../types";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { X, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
const lucideIcons = { AlignLeft, AlignCenter, AlignRight };
import { TextEditor } from "./TextEditor/TextEditor";
import { Input } from "@/components/ui/input";

interface RegularPropertyPanelProps {
  element: FormElement;
  onUpdateProperty: (elementId: string, property: string, value: any) => void;
  onFormValueChange?: (elementId: string, value: any) => void;
  isTableCell?: boolean;
  activeTab?: string;
}

export const RegularPropertyPanel: React.FC<RegularPropertyPanelProps> = ({
  element,
  onUpdateProperty,
  onFormValueChange,
  isTableCell = false,
  activeTab = "basic",
}) => {
  const { properties, i } = element;
  const [inputStyleTab, setInputStyleTab] = useState("preview");

  const renderPropertyInput = (key: string, value: any) => {
    // Special case for spacing properties
    if (key === "labelSpacing" || key === "labelSpacingPDF") {
      return (
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Slider
              value={[value || (key === "labelSpacing" ? 8 : 1)]}
              min={0}
              max={48}
              step={1}
              onValueChange={([newValue]) => {
                onUpdateProperty(i, key, newValue);
              }}
            />
          </div>
          <div className="w-20">
            <div className="relative">
              <Input
                type="number"
                min={0}
                max={48}
                value={value || (key === "labelSpacing" ? 8 : 1)}
                onChange={(e) => {
                  const newValue = Number(e.target.value);
                  onUpdateProperty(i, key, newValue);
                }}
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                px
              </span>
            </div>
          </div>
        </div>
      );
    }

    // Special case for text editor
    if (
      (element.type === "plainText" && key === "defaultText") ||
      key === "label"
    ) {
      return (
        <div className="flex items-center gap-2">
          <Input
            value={typeof value === "object" ? value.text : value || ""}
            onChange={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const newValue =
                typeof value === "object"
                  ? { ...value, text: e.target.value }
                  : e.target.value;
              onUpdateProperty(i, key, newValue);
            }}
            className="flex-1"
            placeholder="Enter text or use editor for formatting"
          />
          <TextEditor
            value={typeof value === "object" ? value.text : value || ""}
            properties={typeof value === "object" ? value : properties}
            onChange={(newValue, newProperties) => {
              const updatedValue = {
                ...(typeof value === "object" ? value : {}),
                ...newProperties,
                text: newValue,
              };
              onUpdateProperty(i, key, updatedValue);
            }}
          />
        </div>
      );
    }

    // Special case for placeholder and defaultValue
    if (key === "placeholder" || key === "defaultValue") {
      return (
        <Input
          value={value || ""}
          onChange={(e) => onUpdateProperty(i, key, e.target.value)}
          placeholder={`Enter ${key.toLowerCase()}`}
        />
      );
    }

    // Rest of the renderPropertyInput function...
    // (Keep the existing switch statement for other property types)

    switch (key) {
      case "required":
      case "showInPreview":
      case "showInPDF":
      case "multiple":
      case "defaultChecked":
      case "showIndicators":
        return (
          <Switch
            checked={value || false}
            onCheckedChange={(checked) => onUpdateProperty(i, key, checked)}
          />
        );

      // ... rest of the cases
      default:
        return (
          <Input
            type={typeof value === "number" ? "number" : "text"}
            value={value || ""}
            onChange={(e) => {
              const newValue =
                typeof value === "number"
                  ? Number(e.target.value)
                  : e.target.value;
              onUpdateProperty(i, key, newValue);
            }}
          />
        );
    }
  };

  const groupProperties = (properties: Record<string, any>) => {
    const groups = {
      basic: [
        "label",
        "placeholder",
        "defaultValue",
        "defaultText",
        "defaultChecked",
        "options",
        "leftLabel",
        "rightLabel",
        "showIndicators",
        "image",
        "rows",
        "labelSpacing",
        "labelSpacingPDF",
      ],
      logic: ["showInPreview", "showInPDF", "multiple", "accept", "maxSize"],
      config: [
        "required",
        "minLength",
        "maxLength",
        "min",
        "max",
        "step",
        "pattern",
      ],
      validation: [],
    };

    const result = {};
    Object.keys(groups).forEach((group) => {
      result[group] = Object.entries(properties || {}).filter(([key]) => {
        return groups[group].includes(key);
      });
    });
    return result;
  };

  const groupedProperties = groupProperties(properties);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {groupedProperties[activeTab].map(([key, value]) => {
          // Full width items
          if (["label", "options"].includes(key)) {
            return (
              <div
                key={key}
                className="col-span-2 space-y-2"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <label className="block text-sm font-medium text-gray-700">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </label>
                {renderPropertyInput(key, value)}
              </div>
            );
          }

          // Side by side items
          return (
            <div
              key={key}
              className="space-y-2"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <label className="block text-sm font-medium text-gray-700">
                {key.replace(/([A-Z])/g, " $1").trim()}
              </label>
              {renderPropertyInput(key, value)}
            </div>
          );
        })}
      </div>

      {/* Input Style Tabs - Only show in Basic tab */}
      {["text", "textarea", "number", "select", "date", "time"].includes(
        element.type,
      ) &&
        activeTab === "basic" && (
          <div className="mt-8 space-y-4">
            <div className="flex bg-gray-100 p-1 rounded-md">
              <button
                onClick={() => setInputStyleTab("preview")}
                className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${inputStyleTab === "preview" ? "bg-white shadow-sm text-blue-600" : "text-gray-600 hover:text-gray-900 hover:bg-white/50"}`}
              >
                Input Style (Preview)
              </button>
              <button
                onClick={() => setInputStyleTab("pdf")}
                className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${inputStyleTab === "pdf" ? "bg-white shadow-sm text-blue-600" : "text-gray-600 hover:text-gray-900 hover:bg-white/50"}`}
              >
                Input Style (PDF)
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Border</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Color
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative w-10 h-10 overflow-hidden rounded-full">
                        <input
                          type="color"
                          value={
                            properties[
                              `input${inputStyleTab === "pdf" ? "BorderColorPDF" : "BorderColor"}`
                            ] || "#d1d5db"
                          }
                          onChange={(e) =>
                            onUpdateProperty(
                              i,
                              `input${inputStyleTab === "pdf" ? "BorderColorPDF" : "BorderColor"}`,
                              e.target.value,
                            )
                          }
                          className="absolute inset-0 w-[150%] h-[150%] -top-2 -left-2 cursor-pointer"
                        />
                      </div>
                      <Input
                        value={
                          properties[
                            `input${inputStyleTab === "pdf" ? "BorderColorPDF" : "BorderColor"}`
                          ] || "#d1d5db"
                        }
                        onChange={(e) =>
                          onUpdateProperty(
                            i,
                            `input${inputStyleTab === "pdf" ? "BorderColorPDF" : "BorderColor"}`,
                            e.target.value,
                          )
                        }
                        placeholder="#d1d5db"
                        className="flex-1 font-mono uppercase"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Width
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Slider
                          value={[
                            properties[
                              `input${inputStyleTab === "pdf" ? "BorderWidthPDF" : "BorderWidth"}`
                            ] || 1,
                          ]}
                          min={0}
                          max={10}
                          step={1}
                          onValueChange={([newValue]) =>
                            onUpdateProperty(
                              i,
                              `input${inputStyleTab === "pdf" ? "BorderWidthPDF" : "BorderWidth"}`,
                              newValue,
                            )
                          }
                        />
                      </div>
                      <div className="w-20">
                        <div className="relative">
                          <Input
                            type="number"
                            min={0}
                            max={10}
                            value={
                              properties[
                                `input${inputStyleTab === "pdf" ? "BorderWidthPDF" : "BorderWidth"}`
                              ] || 1
                            }
                            onChange={(e) =>
                              onUpdateProperty(
                                i,
                                `input${inputStyleTab === "pdf" ? "BorderWidthPDF" : "BorderWidth"}`,
                                Number(e.target.value),
                              )
                            }
                            className="pr-8"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                            px
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Style
                    </label>
                    <select
                      value={
                        properties[
                          `input${inputStyleTab === "pdf" ? "BorderStylePDF" : "BorderStyle"}`
                        ] || "solid"
                      }
                      onChange={(e) =>
                        onUpdateProperty(
                          i,
                          `input${inputStyleTab === "pdf" ? "BorderStylePDF" : "BorderStyle"}`,
                          e.target.value,
                        )
                      }
                      className="w-full px-3 py-2 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    >
                      <option value="solid">Solid</option>
                      <option value="dashed">Dashed</option>
                      <option value="dotted">Dotted</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Radius
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Slider
                          value={[
                            properties[
                              `input${inputStyleTab === "pdf" ? "BorderRadiusPDF" : "BorderRadius"}`
                            ] || 4,
                          ]}
                          min={0}
                          max={20}
                          step={1}
                          onValueChange={([newValue]) =>
                            onUpdateProperty(
                              i,
                              `input${inputStyleTab === "pdf" ? "BorderRadiusPDF" : "BorderRadius"}`,
                              newValue,
                            )
                          }
                        />
                      </div>
                      <div className="w-20">
                        <div className="relative">
                          <Input
                            type="number"
                            min={0}
                            max={20}
                            value={
                              properties[
                                `input${inputStyleTab === "pdf" ? "BorderRadiusPDF" : "BorderRadius"}`
                              ] || 4
                            }
                            onChange={(e) =>
                              onUpdateProperty(
                                i,
                                `input${inputStyleTab === "pdf" ? "BorderRadiusPDF" : "BorderRadius"}`,
                                Number(e.target.value),
                              )
                            }
                            className="pr-8"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                            px
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Typography</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Font Color
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative w-10 h-10 overflow-hidden rounded-full">
                        <input
                          type="color"
                          value={
                            properties[
                              `input${inputStyleTab === "pdf" ? "FontColorPDF" : "FontColor"}`
                            ] || "#000000"
                          }
                          onChange={(e) =>
                            onUpdateProperty(
                              i,
                              `input${inputStyleTab === "pdf" ? "FontColorPDF" : "FontColor"}`,
                              e.target.value,
                            )
                          }
                          className="absolute inset-0 w-[150%] h-[150%] -top-2 -left-2 cursor-pointer"
                        />
                      </div>
                      <Input
                        value={
                          properties[
                            `input${inputStyleTab === "pdf" ? "FontColorPDF" : "FontColor"}`
                          ] || "#000000"
                        }
                        onChange={(e) =>
                          onUpdateProperty(
                            i,
                            `input${inputStyleTab === "pdf" ? "FontColorPDF" : "FontColor"}`,
                            e.target.value,
                          )
                        }
                        placeholder="#000000"
                        className="flex-1 font-mono uppercase"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Size
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        min={8}
                        max={32}
                        value={
                          properties[
                            `input${inputStyleTab === "pdf" ? "FontSizePDF" : "FontSize"}`
                          ] || 14
                        }
                        onChange={(e) =>
                          onUpdateProperty(
                            i,
                            `input${inputStyleTab === "pdf" ? "FontSizePDF" : "FontSize"}`,
                            Number(e.target.value),
                          )
                        }
                        className="pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                        px
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Weight
                    </label>
                    <select
                      value={
                        properties[
                          `input${inputStyleTab === "pdf" ? "FontWeightPDF" : "FontWeight"}`
                        ] || "normal"
                      }
                      onChange={(e) =>
                        onUpdateProperty(
                          i,
                          `input${inputStyleTab === "pdf" ? "FontWeightPDF" : "FontWeight"}`,
                          e.target.value,
                        )
                      }
                      className="w-full px-3 py-2 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    >
                      <option value="normal">Normal</option>
                      <option value="medium">Medium</option>
                      <option value="bold">Bold</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Style
                    </label>
                    <select
                      value={
                        properties[
                          `input${inputStyleTab === "pdf" ? "FontStylePDF" : "FontStyle"}`
                        ] || "normal"
                      }
                      onChange={(e) =>
                        onUpdateProperty(
                          i,
                          `input${inputStyleTab === "pdf" ? "FontStylePDF" : "FontStyle"}`,
                          e.target.value,
                        )
                      }
                      className="w-full px-3 py-2 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    >
                      <option value="normal">Normal</option>
                      <option value="italic">Italic</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Dimensions</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Height
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Slider
                          value={[
                            properties[
                              `input${inputStyleTab === "pdf" ? "HeightPDF" : "Height"}`
                            ] || 40,
                          ]}
                          min={20}
                          max={200}
                          step={1}
                          onValueChange={([newValue]) =>
                            onUpdateProperty(
                              i,
                              `input${inputStyleTab === "pdf" ? "HeightPDF" : "Height"}`,
                              newValue,
                            )
                          }
                        />
                      </div>
                      <div className="w-20">
                        <div className="relative">
                          <Input
                            type="number"
                            min={20}
                            max={200}
                            value={
                              properties[
                                `input${inputStyleTab === "pdf" ? "HeightPDF" : "Height"}`
                              ] || 40
                            }
                            onChange={(e) =>
                              onUpdateProperty(
                                i,
                                `input${inputStyleTab === "pdf" ? "HeightPDF" : "Height"}`,
                                Number(e.target.value),
                              )
                            }
                            className="pr-8"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                            px
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Text Align
                    </label>
                    <div className="flex gap-2">
                      {[
                        { value: "left", icon: "AlignLeft" },
                        { value: "center", icon: "AlignCenter" },
                        { value: "right", icon: "AlignRight" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() =>
                            onUpdateProperty(
                              i,
                              `input${inputStyleTab === "pdf" ? "TextAlignPDF" : "TextAlign"}`,
                              option.value,
                            )
                          }
                          className={`flex-1 p-2 border rounded-md transition-all ${
                            properties[
                              `input${inputStyleTab === "pdf" ? "TextAlignPDF" : "TextAlign"}`
                            ] === option.value
                              ? "bg-primary text-white"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          <span className="flex items-center justify-center">
                            {React.createElement(lucideIcons[option.icon], {
                              size: 16,
                            })}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};
