import React, { useState } from "react";
import { FormElement } from "../types";
import { ELEMENT_TYPES } from "../constants";
import { RegularPropertyPanel } from "./RegularPropertyPanel";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

interface PropertyPanelProps {
  element: FormElement;
  onUpdateProperty: (elementId: string, property: string, value: any) => void;
  onFormValueChange?: (elementId: string, value: any) => void;
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({
  element,
  onUpdateProperty,
  onFormValueChange,
}) => {
  const { properties, i } = element;
  const [activeTab, setActiveTab] = useState("basic");
  const [cellActiveTab, setCellActiveTab] = useState("element");
  const [borderStyleTab, setBorderStyleTab] = useState("preview");
  const [selectedCell, setSelectedCell] = useState("");

  const getDefaultCellSize = () => {
    return 12 / (properties.columns || 1);
  };

  const handleCellSizeChange = (newSize: number) => {
    if (!selectedCell) return;

    const updatedCells = {
      ...properties.cells,
      [selectedCell]: {
        ...properties.cells?.[selectedCell],
        style: {
          ...properties.cells?.[selectedCell]?.style,
          size: newSize,
        },
      },
    };
    onUpdateProperty(i, "cells", updatedCells);
  };

  const renderCellOptions = () => {
    const options = [];
    for (let row = 0; row < (properties.rows || 1); row++) {
      for (let col = 0; col < (properties.columns || 1); col++) {
        const key = `${row}-${col}`;
        options.push(
          <option key={key} value={key}>
            Cell {key}
          </option>,
        );
      }
    }
    return options;
  };

  const renderTableControls = () => {
    if (element.type !== "table") return null;

    if (activeTab === "logic") {
      return (
        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="font-medium">Table Border Style</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Border Width
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Slider
                      value={[properties.borderWidth || 1]}
                      min={1}
                      max={10}
                      step={1}
                      onValueChange={([value]) =>
                        onUpdateProperty(i, "borderWidth", value)
                      }
                    />
                  </div>
                  <div className="w-20">
                    <div className="relative">
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        value={properties.borderWidth || 1}
                        onChange={(e) =>
                          onUpdateProperty(
                            i,
                            "borderWidth",
                            Math.max(1, Number(e.target.value)),
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
                  Border Color
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative w-10 h-10 overflow-hidden rounded-full">
                    <input
                      type="color"
                      value={properties.borderColor || "#6b7280"}
                      onChange={(e) =>
                        onUpdateProperty(i, "borderColor", e.target.value)
                      }
                      className="absolute inset-0 w-[150%] h-[150%] -top-2 -left-2 cursor-pointer"
                    />
                  </div>
                  <Input
                    type="text"
                    value={properties.borderColor || "#6b7280"}
                    onChange={(e) =>
                      onUpdateProperty(i, "borderColor", e.target.value)
                    }
                    className="flex-1 font-mono uppercase"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Border Style
                </label>
                <select
                  value={properties.borderStyle || "solid"}
                  onChange={(e) =>
                    onUpdateProperty(i, "borderStyle", e.target.value)
                  }
                  className="w-full p-2 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                >
                  <option value="solid">Solid</option>
                  <option value="dashed">Dashed</option>
                  <option value="dotted">Dotted</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Border Radius
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Slider
                      value={[properties.borderRadius || 0]}
                      min={0}
                      max={20}
                      step={1}
                      onValueChange={([value]) =>
                        onUpdateProperty(i, "borderRadius", value)
                      }
                    />
                  </div>
                  <div className="w-20">
                    <div className="relative">
                      <Input
                        type="number"
                        min={0}
                        max={20}
                        value={properties.borderRadius || 0}
                        onChange={(e) =>
                          onUpdateProperty(
                            i,
                            "borderRadius",
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

            <div className="space-y-4 mt-6 border-t pt-6">
              <h4 className="font-medium">Table Visibility</h4>
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={properties.showInPreview ?? true}
                    onCheckedChange={(checked) =>
                      onUpdateProperty(i, "showInPreview", checked)
                    }
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Show in Preview
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={properties.showInPDF ?? true}
                    onCheckedChange={(checked) =>
                      onUpdateProperty(i, "showInPDF", checked)
                    }
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Show in PDF
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "basic") {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Rows</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    onUpdateProperty(
                      i,
                      "rows",
                      Math.max(1, (properties.rows || 1) - 1),
                    )
                  }
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={properties.rows || 1}
                  onChange={(e) =>
                    onUpdateProperty(
                      i,
                      "rows",
                      Math.max(1, parseInt(e.target.value) || 1),
                    )
                  }
                  className="w-16 text-center p-2 border rounded-md"
                />
                <button
                  onClick={() =>
                    onUpdateProperty(i, "rows", (properties.rows || 1) + 1)
                  }
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Columns</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    onUpdateProperty(
                      i,
                      "columns",
                      Math.max(1, (properties.columns || 1) - 1),
                    )
                  }
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={properties.columns || 1}
                  onChange={(e) =>
                    onUpdateProperty(
                      i,
                      "columns",
                      Math.max(1, parseInt(e.target.value) || 1),
                    )
                  }
                  className="w-16 text-center p-2 border rounded-md"
                />
                <button
                  onClick={() =>
                    onUpdateProperty(
                      i,
                      "columns",
                      (properties.columns || 1) + 1,
                    )
                  }
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Select a Cell</label>
            <select
              className="w-full p-2 border rounded"
              value={selectedCell}
              onChange={(e) => setSelectedCell(e.target.value)}
            >
              <option value="">Select cell</option>
              {renderCellOptions()}
            </select>
          </div>

          {selectedCell && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Select Element Type
                </label>
                <select
                  className="w-full p-2 border rounded"
                  value={properties.cells?.[selectedCell]?.type || ""}
                  onChange={(e) => {
                    if (!selectedCell) return;

                    const elementType = ELEMENT_TYPES.find(
                      (t) => t.id === e.target.value,
                    );
                    if (!elementType) return;

                    const newElement = {
                      i: `${i}-${selectedCell}`,
                      type: elementType.id,
                      properties: {
                        ...elementType.properties,
                        labelSpacing: 8,
                        labelSpacingPDF: 1,
                        showInPreview: true,
                        showInPDF: true,
                        label: {
                          text: elementType.label,
                          fontSize: "14px",
                          textColor: "#000000",
                          backgroundColor: "transparent",
                          fontWeight: "normal",
                          fontStyle: "normal",
                          textAlign: "left",
                          textDecoration: "none",
                          lineHeight: "1.5",
                          letterSpacing: "normal",
                          padding: "0px",
                        },
                      },
                    };

                    onUpdateProperty(i, "cells", {
                      ...properties.cells,
                      [selectedCell]: newElement,
                    });
                  }}
                >
                  <option value="">Select element type</option>
                  {ELEMENT_TYPES.filter((t) => {
                    return !(t as any).advanced && t.id !== "table";
                  }).map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {properties.cells?.[selectedCell] && (
                <div className="border-t pt-4">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">
                      Cell Element Properties
                    </h4>
                    <div className="flex bg-gray-100 p-1 rounded-md">
                      <button
                        onClick={() => setCellActiveTab("element")}
                        className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${cellActiveTab === "element" ? "bg-white shadow-sm text-blue-600" : "text-gray-600 hover:text-gray-900 hover:bg-white/50"}`}
                      >
                        Cell Element
                      </button>
                      <button
                        onClick={() => setCellActiveTab("style")}
                        className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${cellActiveTab === "style" ? "bg-white shadow-sm text-blue-600" : "text-gray-600 hover:text-gray-900 hover:bg-white/50"}`}
                      >
                        Cell Style
                      </button>
                    </div>

                    {cellActiveTab === "element" &&
                      (properties.cells?.[selectedCell]?.type ? (
                        <RegularPropertyPanel
                          element={properties.cells[selectedCell]}
                          onUpdateProperty={(elementId, property, value) => {
                            const updatedCellContent = {
                              ...properties.cells[selectedCell],
                              properties: {
                                ...properties.cells[selectedCell].properties,
                                [property]: value,
                              },
                            };
                            onUpdateProperty(i, "cells", {
                              ...properties.cells,
                              [selectedCell]: updatedCellContent,
                            });
                          }}
                          onFormValueChange={(elementId, value) => {
                            onFormValueChange?.(`${i}-${selectedCell}`, value);
                          }}
                          isTableCell={true}
                        />
                      ) : (
                        <div className="p-4 text-center text-gray-500 border border-dashed rounded-md">
                          Please select an element to show its properties.
                        </div>
                      ))}

                    {cellActiveTab === "style" && (
                      <div className="space-y-4">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium">
                              Background Color
                            </label>
                            <input
                              type="color"
                              value={
                                properties.cells?.[selectedCell]?.style
                                  ?.backgroundColor || "#ffffff"
                              }
                              onChange={(e) => {
                                const updatedCells = {
                                  ...properties.cells,
                                  [selectedCell]: {
                                    ...properties.cells?.[selectedCell],
                                    style: {
                                      ...properties.cells?.[selectedCell]
                                        ?.style,
                                      backgroundColor: e.target.value,
                                    },
                                  },
                                };
                                onUpdateProperty(i, "cells", updatedCells);
                              }}
                              className="w-full h-10 p-1 rounded border"
                            />
                          </div>

                          <div className="space-y-4">
                            <div className="flex bg-gray-100 p-1 rounded-md">
                              <button
                                onClick={() => setBorderStyleTab("preview")}
                                className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${borderStyleTab === "preview" ? "bg-white shadow-sm text-blue-600" : "text-gray-600 hover:text-gray-900 hover:bg-white/50"}`}
                              >
                                Cell Border Style (Preview)
                              </button>
                              <button
                                onClick={() => setBorderStyleTab("pdf")}
                                className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${borderStyleTab === "pdf" ? "bg-white shadow-sm text-blue-600" : "text-gray-600 hover:text-gray-900 hover:bg-white/50"}`}
                              >
                                Cell Border Style (PDF)
                              </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="block text-sm font-medium">
                                  Left Border Color
                                </label>
                                <input
                                  type="color"
                                  value={
                                    properties.cells?.[selectedCell]?.style?.[
                                      `${borderStyleTab === "pdf" ? "leftBorderColorPDF" : "leftBorderColor"}`
                                    ] || "#d1d5db"
                                  }
                                  onChange={(e) => {
                                    const updatedCells = {
                                      ...properties.cells,
                                      [selectedCell]: {
                                        ...properties.cells?.[selectedCell],
                                        style: {
                                          ...properties.cells?.[selectedCell]
                                            ?.style,
                                          [`${borderStyleTab === "pdf" ? "leftBorderColorPDF" : "leftBorderColor"}`]:
                                            e.target.value,
                                        },
                                      },
                                    };
                                    onUpdateProperty(i, "cells", updatedCells);
                                  }}
                                  className="w-full h-10 p-1 rounded border"
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="block text-sm font-medium">
                                  Right Border Color
                                </label>
                                <input
                                  type="color"
                                  value={
                                    properties.cells?.[selectedCell]?.style?.[
                                      `${borderStyleTab === "pdf" ? "rightBorderColorPDF" : "rightBorderColor"}`
                                    ] || "#d1d5db"
                                  }
                                  onChange={(e) => {
                                    const updatedCells = {
                                      ...properties.cells,
                                      [selectedCell]: {
                                        ...properties.cells?.[selectedCell],
                                        style: {
                                          ...properties.cells?.[selectedCell]
                                            ?.style,
                                          [`${borderStyleTab === "pdf" ? "rightBorderColorPDF" : "rightBorderColor"}`]:
                                            e.target.value,
                                        },
                                      },
                                    };
                                    onUpdateProperty(i, "cells", updatedCells);
                                  }}
                                  className="w-full h-10 p-1 rounded border"
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="block text-sm font-medium">
                                  Top Border Color
                                </label>
                                <input
                                  type="color"
                                  value={
                                    properties.cells?.[selectedCell]?.style?.[
                                      `${borderStyleTab === "pdf" ? "topBorderColorPDF" : "topBorderColor"}`
                                    ] || "#d1d5db"
                                  }
                                  onChange={(e) => {
                                    const updatedCells = {
                                      ...properties.cells,
                                      [selectedCell]: {
                                        ...properties.cells?.[selectedCell],
                                        style: {
                                          ...properties.cells?.[selectedCell]
                                            ?.style,
                                          [`${borderStyleTab === "pdf" ? "topBorderColorPDF" : "topBorderColor"}`]:
                                            e.target.value,
                                        },
                                      },
                                    };
                                    onUpdateProperty(i, "cells", updatedCells);
                                  }}
                                  className="w-full h-10 p-1 rounded border"
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="block text-sm font-medium">
                                  Bottom Border Color
                                </label>
                                <input
                                  type="color"
                                  value={
                                    properties.cells?.[selectedCell]?.style?.[
                                      `${borderStyleTab === "pdf" ? "bottomBorderColorPDF" : "bottomBorderColor"}`
                                    ] || "#d1d5db"
                                  }
                                  onChange={(e) => {
                                    const updatedCells = {
                                      ...properties.cells,
                                      [selectedCell]: {
                                        ...properties.cells?.[selectedCell],
                                        style: {
                                          ...properties.cells?.[selectedCell]
                                            ?.style,
                                          [`${borderStyleTab === "pdf" ? "bottomBorderColorPDF" : "bottomBorderColor"}`]:
                                            e.target.value,
                                        },
                                      },
                                    };
                                    onUpdateProperty(i, "cells", updatedCells);
                                  }}
                                  className="w-full h-10 p-1 rounded border"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium">
                              Colspan Left
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                min="0"
                                max={(() => {
                                  if (!selectedCell) return 0;
                                  const [row, col] = selectedCell
                                    .split("-")
                                    .map(Number);
                                  return col;
                                })()}
                                value={
                                  properties.cells?.[selectedCell]?.style
                                    ?.colspanLeft || 0
                                }
                                onChange={(e) => {
                                  const updatedCells = {
                                    ...properties.cells,
                                    [selectedCell]: {
                                      ...properties.cells?.[selectedCell],
                                      style: {
                                        ...properties.cells?.[selectedCell]
                                          ?.style,
                                        colspanLeft: Number(e.target.value),
                                      },
                                    },
                                  };
                                  onUpdateProperty(i, "cells", updatedCells);
                                }}
                                className="w-full p-2 pr-8 border rounded"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                cells
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-medium">
                              Colspan Right
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                min="0"
                                max={(() => {
                                  if (!selectedCell) return 0;
                                  const [row, col] = selectedCell
                                    .split("-")
                                    .map(Number);
                                  return properties.columns - col - 1;
                                })()}
                                value={
                                  properties.cells?.[selectedCell]?.style
                                    ?.colspanRight || 0
                                }
                                onChange={(e) => {
                                  const newColspanRight = Number(
                                    e.target.value,
                                  );
                                  const [row, col] = selectedCell
                                    .split("-")
                                    .map(Number);
                                  const defaultCellSize =
                                    12 / properties.columns;
                                  const updatedCells = { ...properties.cells };

                                  // Update the selected cell's colspan and size
                                  updatedCells[selectedCell] = {
                                    ...updatedCells[selectedCell],
                                    style: {
                                      ...updatedCells[selectedCell]?.style,
                                      colspanRight: newColspanRight,
                                      size:
                                        defaultCellSize * (newColspanRight + 1),
                                    },
                                  };

                                  onUpdateProperty(i, "cells", updatedCells);
                                }}
                                className="w-full p-2 pr-8 border rounded"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                cells
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium">
                              Cell Size (1-12)
                              {(properties.columns || 1) <= 1 ? (
                                <span className="text-xs text-gray-500 ml-2">
                                  Add more columns to adjust size
                                </span>
                              ) : (properties.cells?.[selectedCell]?.style
                                  ?.colspanRight || 0) > 0 ? (
                                <span className="text-xs text-gray-500 ml-2">
                                  Size locked due to colspan
                                </span>
                              ) : null}
                            </label>
                            <div className="flex items-center gap-4">
                              <div className="flex-1">
                                <Slider
                                  disabled={
                                    (properties.columns || 1) <= 1 ||
                                    (properties.cells?.[selectedCell]?.style
                                      ?.colspanRight || 0) > 0
                                  }
                                  value={[
                                    properties.cells?.[selectedCell]?.style
                                      ?.size || getDefaultCellSize(),
                                  ]}
                                  min={1}
                                  max={12}
                                  step={0.1}
                                  onValueChange={([value]) =>
                                    handleCellSizeChange(value)
                                  }
                                />
                              </div>
                              <div className="w-20">
                                <input
                                  type="number"
                                  min="1"
                                  max="12"
                                  step="0.1"
                                  value={
                                    properties.cells?.[selectedCell]?.style
                                      ?.size || getDefaultCellSize()
                                  }
                                  onChange={(e) => {
                                    const newValue = parseFloat(e.target.value);
                                    if (!isNaN(newValue)) {
                                      handleCellSizeChange(newValue);
                                    }
                                  }}
                                  className="w-full p-2 border rounded text-center"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-medium">
                              Padding
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                min="0"
                                max="48"
                                value={
                                  properties.cells?.[selectedCell]?.style
                                    ?.padding || 8
                                }
                                onChange={(e) => {
                                  const updatedCells = {
                                    ...properties.cells,
                                    [selectedCell]: {
                                      ...properties.cells?.[selectedCell],
                                      style: {
                                        ...properties.cells?.[selectedCell]
                                          ?.style,
                                        padding: Number(e.target.value),
                                      },
                                    },
                                  };
                                  onUpdateProperty(i, "cells", updatedCells);
                                }}
                                className="w-full p-2 pr-8 border rounded"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                px
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    // For other tabs, show regular property panel
    return (
      <RegularPropertyPanel
        element={element}
        onUpdateProperty={onUpdateProperty}
        onFormValueChange={onFormValueChange}
        activeTab={activeTab}
      />
    );
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border sticky top-4">
      <h3 className="text-lg font-semibold mb-4">Properties</h3>

      <div className="flex bg-gray-100 p-1 rounded-md mb-4">
        {(element.type === "table"
          ? ["basic", "logic"]
          : ["basic", "logic", "config", "validation"]
        ).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === tab ? "bg-white shadow-sm text-blue-600" : "text-gray-600 hover:text-gray-900 hover:bg-white/50"}`}
          >
            {element.type === "table" && tab === "logic"
              ? "Table Style"
              : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {element.type === "table" ? (
        renderTableControls()
      ) : (
        <RegularPropertyPanel
          element={element}
          onUpdateProperty={onUpdateProperty}
          onFormValueChange={onFormValueChange}
          activeTab={activeTab}
        />
      )}
    </div>
  );
};
