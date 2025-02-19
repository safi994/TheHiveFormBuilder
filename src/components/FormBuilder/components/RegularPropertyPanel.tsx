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
  const [inputStyleTab, setInputStyleTab] = useState<"preview" | "pdf">(
    "preview",
  );

  const renderPropertyInput = (key: string, value: any) => {
    if (key === "label" && element.type === "plainText" && isTableCell) {
      return null;
    }

    if (
      (element.type === "plainText" && key === "defaultText") ||
      (key === "label" && (!isTableCell || element.type !== "plainText"))
    ) {
      return (
        <div className="flex items-center gap-2">
          <Input
            value={typeof value === "object" ? value.text : value || ""}
            onChange={(e) => {
              const newText = e.target.value;
              if (typeof value === "object") {
                onUpdateProperty(i, key, { ...value, text: newText });
              } else {
                onUpdateProperty(i, key, newText);
              }
            }}
            className="flex-1"
            placeholder="Enter text or use editor..."
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

    if (key === "options") {
      return renderOptionsInput(value, (newOptions) =>
        onUpdateProperty(i, key, newOptions),
      );
    }

    if (key === "placeholder" || key === "defaultValue") {
      return (
        <Input
          value={value || ""}
          onChange={(e) => onUpdateProperty(i, key, e.target.value)}
          placeholder={`Enter ${key.toLowerCase()}`}
        />
      );
    }

    switch (key) {
      case "required":
      case "showInPreview":
      case "showInPDF":
      case "multiple":
      case "defaultChecked":
      case "showIndicators":
        return (
          <Switch
            checked={Boolean(value)}
            onCheckedChange={(checked) => onUpdateProperty(i, key, checked)}
          />
        );

      default:
        return (
          <Input
            type={typeof value === "number" ? "number" : "text"}
            value={value ?? ""}
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

  const renderOptionsInput = (
    options: any[] = [],
    onChange: (newOptions: any[]) => void,
  ) => {
    return (
      <div className="space-y-2">
        <div className="text-sm font-medium mb-2">Options</div>
        <div className="text-sm font-medium mb-4">Select Options and Keys</div>
        {options.map((option, index) => (
          <div key={index} className="flex items-center gap-2 mb-2">
            <Input
              value={typeof option === "object" ? option.text : option}
              onChange={(e) => {
                const newOptions = [...options];
                if (typeof option === "object") {
                  newOptions[index] = {
                    ...option,
                    text: e.target.value,
                    preview: option.preview,
                    print: option.print,
                  };
                } else {
                  newOptions[index] = {
                    text: e.target.value,
                    key: option.key || `KEY-${index + 1}`,
                    preview: option.preview || {},
                    print: option.print || {},
                  };
                }
                onChange(newOptions);
              }}
              placeholder="Option text"
            />

            {element.type !== "select" && (
              <TextEditor
                value={typeof option === "object" ? option.text : option}
                properties={typeof option === "object" ? option : {}}
                onChange={(newValue, newProperties) => {
                  const newOptions = [...options];
                  if (typeof option === "object") {
                    newOptions[index] = {
                      ...option,
                      ...newProperties,
                      text: newValue,
                    };
                  } else {
                    newOptions[index] = {
                      text: newValue,
                      key: `KEY-${index + 1}`,
                      ...newProperties,
                    };
                  }
                  onChange(newOptions);
                }}
              />
            )}

            <Input
              value={
                typeof option === "object" ? option.key : `KEY-${index + 1}`
              }
              onChange={(e) => {
                const newOptions = [...options];
                if (typeof option === "object") {
                  newOptions[index] = { ...option, key: e.target.value };
                } else {
                  newOptions[index] = { text: option, key: e.target.value };
                }
                onChange(newOptions);
              }}
              placeholder="Option key"
            />

            <button
              onClick={() => {
                const newOptions = options.filter((_, i) => i !== index);
                onChange(newOptions);
              }}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        ))}

        <button
          onClick={() => {
            const newOptions = [
              ...options,
              {
                text: `Option ${options.length + 1}`,
                key: `KEY-${options.length + 1}`,
              },
            ];
            onChange(newOptions);
          }}
          className="w-full p-2 border border-dashed rounded-md hover:bg-gray-50 transition-colors text-sm text-gray-600"
        >
          Add +
        </button>
      </div>
    );
  };

  const groupProperties = (props: Record<string, any>) => {
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

    const result: Record<string, [string, any][]> = {
      basic: [],
      logic: [],
      config: [],
      validation: [],
    };

    Object.keys(groups).forEach((group) => {
      result[group] = Object.entries(props || {}).filter(([key]) =>
        groups[group].includes(key),
      );
    });

    return result;
  };

  const groupedProperties = groupProperties(properties);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {groupedProperties[activeTab].map(([key, value]) => {
          if (key === "label" && element.type === "plainText" && isTableCell) {
            return null;
          }
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

      {["text", "textarea", "number", "select", "date", "time"].includes(
        element.type,
      ) &&
        activeTab === "basic" && (
          <div className="mt-8 space-y-4">
            <div className="flex bg-gray-100 p-1 rounded-md">
              <button
                onClick={() => setInputStyleTab("preview")}
                className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  inputStyleTab === "preview"
                    ? "bg-white shadow-sm text-blue-600"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                }`}
              >
                Input Style (Preview)
              </button>
              <button
                onClick={() => setInputStyleTab("pdf")}
                className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  inputStyleTab === "pdf"
                    ? "bg-white shadow-sm text-blue-600"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                }`}
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
                              `input${
                                inputStyleTab === "pdf"
                                  ? "BorderColorPDF"
                                  : "BorderColor"
                              }`,
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
                            `input${
                              inputStyleTab === "pdf"
                                ? "BorderColorPDF"
                                : "BorderColor"
                            }`,
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
                              `input${
                                inputStyleTab === "pdf"
                                  ? "BorderWidthPDF"
                                  : "BorderWidth"
                              }`
                            ] || 1,
                          ]}
                          min={0}
                          max={10}
                          step={1}
                          onValueChange={([newValue]) =>
                            onUpdateProperty(
                              i,
                              `input${
                                inputStyleTab === "pdf"
                                  ? "BorderWidthPDF"
                                  : "BorderWidth"
                              }`,
                              newValue,
                            )
                          }
                        />
                      </div>
                      <div className="w-20 relative">
                        <Input
                          type="number"
                          min={0}
                          max={10}
                          value={
                            properties[
                              `input${
                                inputStyleTab === "pdf"
                                  ? "BorderWidthPDF"
                                  : "BorderWidth"
                              }`
                            ] || 1
                          }
                          onChange={(e) =>
                            onUpdateProperty(
                              i,
                              `input${
                                inputStyleTab === "pdf"
                                  ? "BorderWidthPDF"
                                  : "BorderWidth"
                              }`,
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

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Style
                    </label>
                    <select
                      value={
                        properties[
                          `input${
                            inputStyleTab === "pdf"
                              ? "BorderStylePDF"
                              : "BorderStyle"
                          }`
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
                              `input${
                                inputStyleTab === "pdf"
                                  ? "BorderRadiusPDF"
                                  : "BorderRadius"
                              }`
                            ] || 0,
                          ]}
                          min={0}
                          max={20}
                          step={1}
                          onValueChange={([newValue]) =>
                            onUpdateProperty(
                              i,
                              `input${
                                inputStyleTab === "pdf"
                                  ? "BorderRadiusPDF"
                                  : "BorderRadius"
                              }`,
                              newValue,
                            )
                          }
                        />
                      </div>
                      <div className="w-20 relative">
                        <Input
                          type="number"
                          min={0}
                          max={20}
                          value={
                            properties[
                              `input${
                                inputStyleTab === "pdf"
                                  ? "BorderRadiusPDF"
                                  : "BorderRadius"
                              }`
                            ] || 0
                          }
                          onChange={(e) =>
                            onUpdateProperty(
                              i,
                              `input${
                                inputStyleTab === "pdf"
                                  ? "BorderRadiusPDF"
                                  : "BorderRadius"
                              }`,
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
                              `input${
                                inputStyleTab === "pdf"
                                  ? "FontColorPDF"
                                  : "FontColor"
                              }`,
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
                            `input${
                              inputStyleTab === "pdf"
                                ? "FontColorPDF"
                                : "FontColor"
                            }`,
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
                      <div className="w-20 relative">
                        <Input
                          type="number"
                          min={20}
                          max={200}
                          value={
                            properties[
                              `input${inputStyleTab === "pdf" ? "HeightPDF" : "Height"}`
                            ] || 20
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

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Text Align
                    </label>
                    <div className="flex gap-2">
                      {[
                        { value: "left", icon: "AlignLeft" },
                        { value: "center", icon: "AlignCenter" },
                        { value: "right", icon: "AlignRight" },
                      ].map((option) => {
                        const Icon = lucideIcons[option.icon];
                        return (
                          <button
                            key={option.value}
                            onClick={() =>
                              onUpdateProperty(
                                i,
                                `input${
                                  inputStyleTab === "pdf"
                                    ? "TextAlignPDF"
                                    : "TextAlign"
                                }`,
                                option.value,
                              )
                            }
                            className={`flex-1 p-2 border rounded-md transition-all ${
                              properties[
                                `input${
                                  inputStyleTab === "pdf"
                                    ? "TextAlignPDF"
                                    : "TextAlign"
                                }`
                              ] === option.value
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "hover:bg-muted"
                            }`}
                          >
                            <Icon className="w-4 h-4 mx-auto" />
                          </button>
                        );
                      })}
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
