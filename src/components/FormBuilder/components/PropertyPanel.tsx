import React from "react";
import { PropertyPanelProps } from "../types";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { X } from "lucide-react";
import config from "../config";
import { TextEditor } from "./TextEditor/TextEditor";
import { ELEMENT_TYPES } from "../constants";

export const PropertyPanel: React.FC<
  PropertyPanelProps & {
    onFormValueChange: (elementId: string, value: any) => void;
  }
> = ({ element, onUpdateProperty, onFormValueChange }) => {
  const { properties, i } = element;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (properties.maxSize && file.size > properties.maxSize * 1024 * 1024) {
      alert(`Image size must be less than ${properties.maxSize}MB`);
      return;
    }

    const url = URL.createObjectURL(file);
    const imageData = { file, url };
    onFormValueChange(i, imageData);
    onUpdateProperty(i, "image", imageData);
  };

  const [selectedCell, setSelectedCell] = React.useState("");
  const [activeTab, setActiveTab] = React.useState("element");
  const [inputStyleTab, setInputStyleTab] = React.useState("preview");

  const getDefaultCellSize = React.useCallback(() => {
    if (!selectedCell) return 12 / (properties.columns || 1);
    const columns = properties.columns || 1;
    const [row] = selectedCell.split("-").map(Number);
    const rowCells = Array.from(
      { length: columns },
      (_, col) => `${row}-${col}`,
    );
    const rowCellsWithSize = rowCells.filter(
      (key) => properties.cells?.[key]?.style?.size,
    );
    const totalExplicitSize = rowCellsWithSize.reduce(
      (sum, key) => sum + (properties.cells[key]?.style?.size || 0),
      0,
    );
    const remaining = rowCells.length - rowCellsWithSize.length;
    return remaining > 0 ? (12 - totalExplicitSize) / remaining : 12 / columns;
  }, [selectedCell, properties.columns, properties.cells]);

  const handleCellSizeChange = React.useCallback(
    (newSize: number) => {
      if (!selectedCell) return;
      const columns = properties.columns || 1;
      const [row] = selectedCell.split("-").map(Number);
      const rowCells = Array.from(
        { length: columns },
        (_, col) => `${row}-${col}`,
      );
      const currentSizes = rowCells.reduce(
        (acc, key) => {
          acc[key] = properties.cells?.[key]?.style?.size || 12 / columns;
          return acc;
        },
        {} as Record<string, number>,
      );
      const sizeDiff = newSize - currentSizes[selectedCell];
      if (sizeDiff !== 0) {
        const otherCells = rowCells.filter((key) => key !== selectedCell);
        const sortedCells = otherCells.sort(
          (a, b) => currentSizes[b] - currentSizes[a],
        );
        if (sizeDiff > 0) {
          let remainingToTake = sizeDiff;
          for (const cell of sortedCells) {
            const availableSpace = Math.max(0, currentSizes[cell] - 1);
            const takeFromThis = Math.min(availableSpace, remainingToTake);
            if (takeFromThis > 0) {
              currentSizes[cell] -= takeFromThis;
              remainingToTake -= takeFromThis;
            }
            if (remainingToTake <= 0) break;
          }
          if (remainingToTake > 0) return;
        } else {
          const spaceToDistribute = -sizeDiff;
          const cellsCount = sortedCells.length;
          if (cellsCount > 0) {
            const spacePerCell = spaceToDistribute / cellsCount;
            sortedCells.forEach((cell) => {
              currentSizes[cell] += spacePerCell;
            });
          }
        }
      }
      currentSizes[selectedCell] = newSize;
      const updatedCells = { ...properties.cells };
      Object.entries(currentSizes).forEach(([key, size]) => {
        updatedCells[key] = {
          ...properties.cells?.[key],
          style: {
            ...properties.cells?.[key]?.style,
            size,
          },
        };
      });
      onUpdateProperty(i, "cells", updatedCells);
    },
    [selectedCell, properties.columns, properties.cells, i, onUpdateProperty],
  );

  const renderCellOptions = React.useCallback(() => {
    const rows = properties.rows || 1;
    const columns = properties.columns || 1;
    let options: JSX.Element[] = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const cellKey = `${row}-${col}`;
        let isReserved = false;
        let reservedBy = "";
        for (let j = 1; j <= columns; j++) {
          const prevCell = `${row}-${col - j}`;
          if (properties.cells?.[prevCell]?.style?.colspanRight >= j) {
            isReserved = true;
            reservedBy = `Cell (${row + 1}, ${col - j + 1})`;
            break;
          }
        }
        if (!isReserved) {
          for (let j = 1; j <= columns; j++) {
            const nextCell = `${row}-${col + j}`;
            if (properties.cells?.[nextCell]?.style?.colspanLeft >= j) {
              isReserved = true;
              reservedBy = `Cell (${row + 1}, ${col + j + 1})`;
              break;
            }
          }
        }
        options.push(
          <option
            key={`${row}-${col}`}
            value={`${row}-${col}`}
            disabled={isReserved}
          >
            Cell ({row + 1}, {col + 1}){" "}
            {isReserved ? `(Reserved by ${reservedBy})` : ""}
          </option>,
        );
      }
    }
    return options;
  }, [properties.rows, properties.columns, properties.cells]);

  const renderTableControls = () => {
    if (element.type !== "table") return null;

    return (
      <div className="space-y-4 mb-4 border-b pb-4">
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
                  onUpdateProperty(i, "columns", (properties.columns || 1) + 1)
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
          <div className="grid grid-cols-1 gap-2">
            <select
              className="w-full p-2 border rounded mb-4"
              value={selectedCell}
              onChange={(e) => setSelectedCell(e.target.value)}
            >
              <option value="">Select cell</option>
              {renderCellOptions()}
            </select>

            {selectedCell && (
              <div className="space-y-4">
                <div className="flex bg-gray-100 p-1 rounded-md">
                  <button
                    onClick={() => setActiveTab("element")}
                    className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === "element" ? "bg-white shadow-sm text-blue-600" : "text-gray-600 hover:text-gray-900 hover:bg-white/50"}`}
                  >
                    Cell Element
                  </button>
                  <button
                    onClick={() => setActiveTab("style")}
                    className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === "style" ? "bg-white shadow-sm text-blue-600" : "text-gray-600 hover:text-gray-900 hover:bg-white/50"}`}
                  >
                    Cell Style
                  </button>
                </div>

                {activeTab === "style" ? (
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
                                ...properties.cells?.[selectedCell]?.style,
                                backgroundColor: e.target.value,
                              },
                            },
                          };
                          onUpdateProperty(i, "cells", updatedCells);
                        }}
                        className="w-full h-10 p-1 rounded border"
                      />
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
                                    ...properties.cells?.[selectedCell]?.style,
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
                              const newColspanRight = Number(e.target.value);
                              const oldColspanRight =
                                properties.cells?.[selectedCell]?.style
                                  ?.colspanRight || 0;
                              const [row, col] = selectedCell
                                .split("-")
                                .map(Number);

                              // Get current cells
                              const currentCells = {
                                ...properties.cells,
                              };

                              // Calculate default cell size
                              const defaultCellSize = 12 / properties.columns;

                              if (newColspanRight > oldColspanRight) {
                                // Increasing colspan
                                const totalSpan = newColspanRight + 1; // +1 for the cell itself
                                const newSize = defaultCellSize * totalSpan;

                                // Update main cell
                                currentCells[selectedCell] = {
                                  ...currentCells[selectedCell],
                                  style: {
                                    ...currentCells[selectedCell]?.style,
                                    colspanRight: newColspanRight,
                                    size: newSize,
                                  },
                                };
                              } else if (newColspanRight < oldColspanRight) {
                                // Decreasing colspan
                                // Reset main cell to default size
                                currentCells[selectedCell] = {
                                  ...currentCells[selectedCell],
                                  style: {
                                    ...currentCells[selectedCell]?.style,
                                    colspanRight: newColspanRight,
                                    size: defaultCellSize,
                                  },
                                };

                                // Reset previously spanned cells to default size
                                for (
                                  let i = newColspanRight + 1;
                                  i <= oldColspanRight;
                                  i++
                                ) {
                                  const nextCell = `${row}-${col + i}`;
                                  if (currentCells[nextCell]) {
                                    currentCells[nextCell] = {
                                      ...currentCells[nextCell],
                                      style: {
                                        ...currentCells[nextCell]?.style,
                                        size: defaultCellSize,
                                      },
                                    };
                                  }
                                }
                              }

                              const updatedCells = currentCells;

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
                                properties.cells?.[selectedCell]?.style?.size ||
                                  getDefaultCellSize(),
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
                                properties.cells?.[selectedCell]?.style?.size ||
                                getDefaultCellSize()
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
                                    ...properties.cells?.[selectedCell]?.style,
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
                ) : (
                  <div className="space-y-4">
                    <select
                      className="w-full p-2 border rounded"
                      value={properties.cells?.[selectedCell]?.type || ""}
                      onChange={(e) => {
                        if (!selectedCell) return;

                        const elementType = ELEMENT_TYPES.find(
                          (t) => t.id === e.target.value,
                        );
                        if (!elementType) return;

                        // Calculate default cell size based on remaining space
                        const [row] = selectedCell.split("-").map(Number);
                        const rowCells = Array.from({
                          length: properties.columns || 1,
                        }).map((_, col) => `${row}-${col}`);
                        const rowCellsWithSize = rowCells.filter(
                          (key) => properties.cells?.[key]?.style?.size,
                        );
                        const totalExplicitSize = rowCellsWithSize.reduce(
                          (sum, key) =>
                            sum + (properties.cells[key]?.style?.size || 0),
                          0,
                        );
                        const remainingCells =
                          rowCells.length - rowCellsWithSize.length;
                        const defaultSize = Math.max(
                          1,
                          remainingCells > 0
                            ? Math.floor(
                                ((12 - totalExplicitSize) / remainingCells) *
                                  100,
                              ) / 100
                            : Math.floor(
                                (12 / (properties.columns || 1)) * 100,
                              ) / 100,
                        );

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
                          style: {
                            size: defaultSize,
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

                    {properties.cells?.[selectedCell] && (
                      <div className="border-t pt-4">
                        <h4 className="text-sm font-medium mb-4">
                          Cell Element Properties
                        </h4>
                        {Object.entries(
                          properties.cells[selectedCell]?.properties || {},
                        )
                          .filter(([key]) => {
                            if (
                              [
                                "text",
                                "textarea",
                                "number",
                                "date",
                                "time",
                                "select",
                              ].includes(properties.cells[selectedCell].type)
                            ) {
                              return !key.startsWith("input");
                            }
                            return true;
                          })
                          .map(([key, value]) => {
                            const cellElement = properties.cells[selectedCell];
                            const showOptions =
                              ["checkbox", "radio", "select"].includes(
                                cellElement.type,
                              ) && key === "options";
                            return (
                              <div
                                key={key}
                                className="mb-4"
                                onClick={(e) => e.stopPropagation()}
                                onMouseDown={(e) => e.stopPropagation()}
                              >
                                <label className="block text-sm font-medium capitalize">
                                  {key.replace(/([A-Z])/g, " $1").trim()}
                                </label>
                                {renderPropertyInput(
                                  key,
                                  value,
                                  (newValue) => {
                                    const updatedCellContent = {
                                      ...properties.cells[selectedCell],
                                      properties: {
                                        ...properties.cells[selectedCell]
                                          .properties,
                                        [key]: newValue,
                                      },
                                    };
                                    onUpdateProperty(i, "cells", {
                                      ...properties.cells,
                                      [selectedCell]: updatedCellContent,
                                    });
                                  },
                                  showOptions ? cellElement : undefined,
                                )}
                              </div>
                            );
                          })}
                      </div>
                    )}
                    {properties.cells?.[selectedCell]?.type &&
                      [
                        "text",
                        "textarea",
                        "number",
                        "date",
                        "time",
                        "select",
                      ].includes(properties.cells[selectedCell].type) && (
                        <div className="mt-4">
                          <div className="flex items-center gap-4 mb-4">
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
                          {inputStyleTab === "preview" && (
                            <div className="space-y-4">
                              <div className="mb-4">
                                <label className="block text-sm font-medium">
                                  Border Color
                                </label>
                                <input
                                  type="color"
                                  value={
                                    properties.cells[selectedCell].properties
                                      .inputBorderColor || "#000000"
                                  }
                                  onChange={(e) => {
                                    const updatedCells = {
                                      ...properties.cells,
                                    };
                                    updatedCells[selectedCell] = {
                                      ...updatedCells[selectedCell],
                                      properties: {
                                        ...updatedCells[selectedCell]
                                          .properties,
                                        inputBorderColor: e.target.value,
                                      },
                                    };
                                    onUpdateProperty(i, "cells", updatedCells);
                                  }}
                                  className="w-full h-10 p-1 rounded border"
                                />
                              </div>
                              <div className="mb-4">
                                <label className="block text-sm font-medium">
                                  Border Radius
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  max="50"
                                  value={
                                    properties.cells[selectedCell].properties
                                      .inputBorderRadius || 0
                                  }
                                  onChange={(e) => {
                                    const updatedCells = {
                                      ...properties.cells,
                                    };
                                    updatedCells[selectedCell] = {
                                      ...updatedCells[selectedCell],
                                      properties: {
                                        ...updatedCells[selectedCell]
                                          .properties,
                                        inputBorderRadius: Number(
                                          e.target.value,
                                        ),
                                      },
                                    };
                                    onUpdateProperty(i, "cells", updatedCells);
                                  }}
                                  className="w-full p-2 border rounded text-center"
                                />
                              </div>
                              <div className="mb-4">
                                <label className="block text-sm font-medium">
                                  Border Width (px)
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  value={
                                    properties.cells[selectedCell].properties
                                      .inputBorderWidth || 1
                                  }
                                  onChange={(e) => {
                                    const updatedCells = {
                                      ...properties.cells,
                                    };
                                    updatedCells[selectedCell] = {
                                      ...updatedCells[selectedCell],
                                      properties: {
                                        ...updatedCells[selectedCell]
                                          .properties,
                                        inputBorderWidth: Number(
                                          e.target.value,
                                        ),
                                      },
                                    };
                                    onUpdateProperty(i, "cells", updatedCells);
                                  }}
                                  className="w-full p-2 border rounded text-center"
                                />
                              </div>
                              <div className="mb-4">
                                <label className="block text-sm font-medium">
                                  Text Alignment
                                </label>
                                <select
                                  value={
                                    properties.cells[selectedCell].properties
                                      .inputTextAlign || "left"
                                  }
                                  onChange={(e) => {
                                    const updatedCells = {
                                      ...properties.cells,
                                    };
                                    updatedCells[selectedCell] = {
                                      ...updatedCells[selectedCell],
                                      properties: {
                                        ...updatedCells[selectedCell]
                                          .properties,
                                        inputTextAlign: e.target.value,
                                      },
                                    };
                                    onUpdateProperty(i, "cells", updatedCells);
                                  }}
                                  className="w-full p-2 border rounded"
                                >
                                  <option value="left">Left</option>
                                  <option value="center">Center</option>
                                  <option value="right">Right</option>
                                </select>
                              </div>
                              <div className="mb-4">
                                <label className="block text-sm font-medium">
                                  Font Size (px)
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  value={
                                    properties.cells[selectedCell].properties
                                      .inputFontSize || 14
                                  }
                                  onChange={(e) => {
                                    const updatedCells = {
                                      ...properties.cells,
                                    };
                                    updatedCells[selectedCell] = {
                                      ...updatedCells[selectedCell],
                                      properties: {
                                        ...updatedCells[selectedCell]
                                          .properties,
                                        inputFontSize: Number(e.target.value),
                                      },
                                    };
                                    onUpdateProperty(i, "cells", updatedCells);
                                  }}
                                  className="w-full p-2 border rounded text-center"
                                />
                              </div>
                              <div className="mb-4">
                                <label className="block text-sm font-medium">
                                  Font Style
                                </label>
                                <select
                                  value={
                                    properties.cells[selectedCell].properties
                                      .inputFontStyle || "normal"
                                  }
                                  onChange={(e) => {
                                    const updatedCells = {
                                      ...properties.cells,
                                    };
                                    updatedCells[selectedCell] = {
                                      ...updatedCells[selectedCell],
                                      properties: {
                                        ...updatedCells[selectedCell]
                                          .properties,
                                        inputFontStyle: e.target.value,
                                      },
                                    };
                                    onUpdateProperty(i, "cells", updatedCells);
                                  }}
                                  className="w-full p-2 border rounded"
                                >
                                  <option value="normal">Normal</option>
                                  <option value="italic">Italic</option>
                                  <option value="oblique">Oblique</option>
                                </select>
                              </div>
                              <div className="mb-4">
                                <label className="block text-sm font-medium">
                                  Font Weight
                                </label>
                                <select
                                  value={
                                    properties.cells[selectedCell].properties
                                      .inputFontWeight || "normal"
                                  }
                                  onChange={(e) => {
                                    const updatedCells = {
                                      ...properties.cells,
                                    };
                                    updatedCells[selectedCell] = {
                                      ...updatedCells[selectedCell],
                                      properties: {
                                        ...updatedCells[selectedCell]
                                          .properties,
                                        inputFontWeight: e.target.value,
                                      },
                                    };
                                    onUpdateProperty(i, "cells", updatedCells);
                                  }}
                                  className="w-full p-2 border rounded"
                                >
                                  <option value="normal">Normal</option>
                                  <option value="bold">Bold</option>
                                  <option value="bolder">Bolder</option>
                                  <option value="lighter">Lighter</option>
                                  <option value="100">100</option>
                                  <option value="200">200</option>
                                  <option value="300">300</option>
                                  <option value="400">400</option>
                                  <option value="500">500</option>
                                  <option value="600">600</option>
                                  <option value="700">700</option>
                                  <option value="800">800</option>
                                  <option value="900">900</option>
                                </select>
                              </div>
                              <div className="mb-4">
                                <label className="block text-sm font-medium">
                                  Font Color
                                </label>
                                <input
                                  type="color"
                                  value={
                                    properties.cells[selectedCell].properties
                                      .inputFontColor || "#000000"
                                  }
                                  onChange={(e) => {
                                    const updatedCells = {
                                      ...properties.cells,
                                    };
                                    updatedCells[selectedCell] = {
                                      ...updatedCells[selectedCell],
                                      properties: {
                                        ...updatedCells[selectedCell]
                                          .properties,
                                        inputFontColor: e.target.value,
                                      },
                                    };
                                    onUpdateProperty(i, "cells", updatedCells);
                                  }}
                                  className="w-full h-10 p-1 rounded border"
                                />
                              </div>
                              <div className="mb-4">
                                <label className="block text-sm font-medium">
                                  Border Style
                                </label>
                                <select
                                  value={
                                    properties.cells[selectedCell].properties
                                      .inputBorderStyle || "solid"
                                  }
                                  onChange={(e) => {
                                    const updatedCells = {
                                      ...properties.cells,
                                    };
                                    updatedCells[selectedCell] = {
                                      ...updatedCells[selectedCell],
                                      properties: {
                                        ...updatedCells[selectedCell]
                                          .properties,
                                        inputBorderStyle: e.target.value,
                                      },
                                    };
                                    onUpdateProperty(i, "cells", updatedCells);
                                  }}
                                  className="w-full p-2 border rounded"
                                >
                                  <option value="solid">Solid</option>
                                  <option value="dashed">Dashed</option>
                                  <option value="dotted">Dotted</option>
                                  <option value="double">Double</option>
                                </select>
                              </div>
                              <div className="mb-4">
                                <label className="block text-sm font-medium">
                                  Input Height (px)
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  value={
                                    properties.cells[selectedCell].properties
                                      .inputHeight || 40
                                  }
                                  onChange={(e) => {
                                    const updatedCells = {
                                      ...properties.cells,
                                    };
                                    updatedCells[selectedCell] = {
                                      ...updatedCells[selectedCell],
                                      properties: {
                                        ...updatedCells[selectedCell]
                                          .properties,
                                        inputHeight: Number(e.target.value),
                                      },
                                    };
                                    onUpdateProperty(i, "cells", updatedCells);
                                  }}
                                  className="w-full p-2 border rounded text-center"
                                />
                              </div>
                            </div>
                          )}
                          {inputStyleTab === "pdf" && (
                            <div className="space-y-4">
                              <div className="mb-4">
                                <label className="block text-sm font-medium">
                                  Border Color (PDF)
                                </label>
                                <input
                                  type="color"
                                  value={
                                    properties.cells[selectedCell].properties
                                      .inputBorderColorPDF || "#000000"
                                  }
                                  onChange={(e) => {
                                    const updatedCells = {
                                      ...properties.cells,
                                    };
                                    updatedCells[selectedCell] = {
                                      ...updatedCells[selectedCell],
                                      properties: {
                                        ...updatedCells[selectedCell]
                                          .properties,
                                        inputBorderColorPDF: e.target.value,
                                      },
                                    };
                                    onUpdateProperty(i, "cells", updatedCells);
                                  }}
                                  className="w-full h-10 p-1 rounded border"
                                />
                              </div>
                              <div className="mb-4">
                                <label className="block text-sm font-medium">
                                  Border Radius (PDF)
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  max="50"
                                  value={
                                    properties.cells[selectedCell].properties
                                      .inputBorderRadiusPDF || 0
                                  }
                                  onChange={(e) => {
                                    const updatedCells = {
                                      ...properties.cells,
                                    };
                                    updatedCells[selectedCell] = {
                                      ...updatedCells[selectedCell],
                                      properties: {
                                        ...updatedCells[selectedCell]
                                          .properties,
                                        inputBorderRadiusPDF: Number(
                                          e.target.value,
                                        ),
                                      },
                                    };
                                    onUpdateProperty(i, "cells", updatedCells);
                                  }}
                                  className="w-full p-2 border rounded text-center"
                                />
                              </div>
                              <div className="mb-4">
                                <label className="block text-sm font-medium">
                                  Border Width (PDF) (px)
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  value={
                                    properties.cells[selectedCell].properties
                                      .inputBorderWidthPDF || 1
                                  }
                                  onChange={(e) => {
                                    const updatedCells = {
                                      ...properties.cells,
                                    };
                                    updatedCells[selectedCell] = {
                                      ...updatedCells[selectedCell],
                                      properties: {
                                        ...updatedCells[selectedCell]
                                          .properties,
                                        inputBorderWidthPDF: Number(
                                          e.target.value,
                                        ),
                                      },
                                    };
                                    onUpdateProperty(i, "cells", updatedCells);
                                  }}
                                  className="w-full p-2 border rounded text-center"
                                />
                              </div>
                              <div className="mb-4">
                                <label className="block text-sm font-medium">
                                  Text Alignment (PDF)
                                </label>
                                <select
                                  value={
                                    properties.cells[selectedCell].properties
                                      .inputTextAlignPDF || "left"
                                  }
                                  onChange={(e) => {
                                    const updatedCells = {
                                      ...properties.cells,
                                    };
                                    updatedCells[selectedCell] = {
                                      ...updatedCells[selectedCell],
                                      properties: {
                                        ...updatedCells[selectedCell]
                                          .properties,
                                        inputTextAlignPDF: e.target.value,
                                      },
                                    };
                                    onUpdateProperty(i, "cells", updatedCells);
                                  }}
                                  className="w-full p-2 border rounded"
                                >
                                  <option value="left">Left</option>
                                  <option value="center">Center</option>
                                  <option value="right">Right</option>
                                </select>
                              </div>
                              <div className="mb-4">
                                <label className="block text-sm font-medium">
                                  Font Size (PDF) (px)
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  value={
                                    properties.cells[selectedCell].properties
                                      .inputFontSizePDF || 14
                                  }
                                  onChange={(e) => {
                                    const updatedCells = {
                                      ...properties.cells,
                                    };
                                    updatedCells[selectedCell] = {
                                      ...updatedCells[selectedCell],
                                      properties: {
                                        ...updatedCells[selectedCell]
                                          .properties,
                                        inputFontSizePDF: Number(
                                          e.target.value,
                                        ),
                                      },
                                    };
                                    onUpdateProperty(i, "cells", updatedCells);
                                  }}
                                  className="w-full p-2 border rounded text-center"
                                />
                              </div>
                              <div className="mb-4">
                                <label className="block text-sm font-medium">
                                  Font Style (PDF)
                                </label>
                                <select
                                  value={
                                    properties.cells[selectedCell].properties
                                      .inputFontStylePDF || "normal"
                                  }
                                  onChange={(e) => {
                                    const updatedCells = {
                                      ...properties.cells,
                                    };
                                    updatedCells[selectedCell] = {
                                      ...updatedCells[selectedCell],
                                      properties: {
                                        ...updatedCells[selectedCell]
                                          .properties,
                                        inputFontStylePDF: e.target.value,
                                      },
                                    };
                                    onUpdateProperty(i, "cells", updatedCells);
                                  }}
                                  className="w-full p-2 border rounded"
                                >
                                  <option value="normal">Normal</option>
                                  <option value="italic">Italic</option>
                                  <option value="oblique">Oblique</option>
                                </select>
                              </div>
                              <div className="mb-4">
                                <label className="block text-sm font-medium">
                                  Font Weight (PDF)
                                </label>
                                <select
                                  value={
                                    properties.cells[selectedCell].properties
                                      .inputFontWeightPDF || "normal"
                                  }
                                  onChange={(e) => {
                                    const updatedCells = {
                                      ...properties.cells,
                                    };
                                    updatedCells[selectedCell] = {
                                      ...updatedCells[selectedCell],
                                      properties: {
                                        ...updatedCells[selectedCell]
                                          .properties,
                                        inputFontWeightPDF: e.target.value,
                                      },
                                    };
                                    onUpdateProperty(i, "cells", updatedCells);
                                  }}
                                  className="w-full p-2 border rounded"
                                >
                                  <option value="normal">Normal</option>
                                  <option value="bold">Bold</option>
                                  <option value="bolder">Bolder</option>
                                  <option value="lighter">Lighter</option>
                                  <option value="100">100</option>
                                  <option value="200">200</option>
                                  <option value="300">300</option>
                                  <option value="400">400</option>
                                  <option value="500">500</option>
                                  <option value="600">600</option>
                                  <option value="700">700</option>
                                  <option value="800">800</option>
                                  <option value="900">900</option>
                                </select>
                              </div>
                              <div className="mb-4">
                                <label className="block text-sm font-medium">
                                  Font Color
                                </label>
                                <input
                                  type="color"
                                  value={
                                    properties.cells[selectedCell].properties
                                      .inputFontColorPDF || "#000000"
                                  }
                                  onChange={(e) => {
                                    const updatedCells = {
                                      ...properties.cells,
                                    };
                                    updatedCells[selectedCell] = {
                                      ...updatedCells[selectedCell],
                                      properties: {
                                        ...updatedCells[selectedCell]
                                          .properties,
                                        inputFontColorPDF: e.target.value,
                                      },
                                    };
                                    onUpdateProperty(i, "cells", updatedCells);
                                  }}
                                  className="w-full h-10 p-1 rounded border"
                                />
                              </div>
                              <div className="mb-4">
                                <label className="block text-sm font-medium">
                                  Border Style
                                </label>
                                <select
                                  value={
                                    properties.cells[selectedCell].properties
                                      .inputBorderStylePDF || "solid"
                                  }
                                  onChange={(e) => {
                                    const updatedCells = {
                                      ...properties.cells,
                                    };
                                    updatedCells[selectedCell] = {
                                      ...updatedCells[selectedCell],
                                      properties: {
                                        ...updatedCells[selectedCell]
                                          .properties,
                                        inputBorderStylePDF: e.target.value,
                                      },
                                    };
                                    onUpdateProperty(i, "cells", updatedCells);
                                  }}
                                  className="w-full p-2 border rounded"
                                >
                                  <option value="solid">Solid</option>
                                  <option value="dashed">Dashed</option>
                                  <option value="dotted">Dotted</option>
                                  <option value="double">Double</option>
                                </select>
                              </div>
                              <div className="mb-4">
                                <label className="block text-sm font-medium">
                                  Input Height (px)
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  value={
                                    properties.cells[selectedCell].properties
                                      .inputHeightPDF || 40
                                  }
                                  onChange={(e) => {
                                    const updatedCells = {
                                      ...properties.cells,
                                    };
                                    updatedCells[selectedCell] = {
                                      ...updatedCells[selectedCell],
                                      properties: {
                                        ...updatedCells[selectedCell]
                                          .properties,
                                        inputHeightPDF: Number(e.target.value),
                                      },
                                    };
                                    onUpdateProperty(i, "cells", updatedCells);
                                  }}
                                  className="w-full p-2 border rounded text-center"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 Table-Properties">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold mb-4">Table Properties</h3>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium">Border Width</label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="10"
                value={properties.borderWidth || 1}
                onChange={(e) =>
                  onUpdateProperty(i, "borderWidth", Number(e.target.value))
                }
                className="w-full p-2 pr-8 border rounded"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                px
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Border Color</label>
            <input
              type="color"
              value={properties.borderColor || "#cccccc"}
              onChange={(e) =>
                onUpdateProperty(i, "borderColor", e.target.value)
              }
              className="w-full h-10 p-1 rounded border"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Border Style</label>
            <select
              value={properties.borderStyle || "solid"}
              onChange={(e) =>
                onUpdateProperty(i, "borderStyle", e.target.value)
              }
              className="w-full p-2 border rounded"
            >
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
              <option value="double">Double</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Border Radius</label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="20"
                value={properties.borderRadius || 0}
                onChange={(e) =>
                  onUpdateProperty(i, "borderRadius", Number(e.target.value))
                }
                className="w-full p-2 pr-8 border rounded"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                px
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPropertyInput = (
    key: string,
    value: any,
    onChange?: (value: any) => void,
    elementForOptions?: any,
  ) => {
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
                  onFormValueChange(i, null);
                  onUpdateProperty(i, "image", null);
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

    if (
      (element.type === "plainText" && key === "defaultText") ||
      (properties.cells?.[selectedCell]?.type === "plainText" &&
        key === "defaultText") ||
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
              onChange
                ? onChange(newValue)
                : onUpdateProperty(i, key, newValue);
            }}
            onClick={(e) => e.stopPropagation()}
            onFocus={(e) => e.stopPropagation()}
            className="flex-1 p-2 border rounded mt-1"
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
              onChange
                ? onChange(updatedValue)
                : onUpdateProperty(i, key, updatedValue);
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
                  const newValue = Number(e.target.value);
                  onChange
                    ? onChange(newValue)
                    : onUpdateProperty(i, key, newValue);
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
                const newValue = Number(e.target.value);
                onChange
                  ? onChange(newValue)
                  : onUpdateProperty(i, key, newValue);
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
              onChange ? onChange(checked) : onUpdateProperty(i, key, checked);
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
              onChange ? onChange(checked) : onUpdateProperty(i, key, checked);
            }}
            className="mt-1"
          />
        );
      case "options":
        if (
          element.type === "checkbox" ||
          element.type === "select" ||
          element.type === "radio" ||
          (elementForOptions &&
            (elementForOptions.type === "checkbox" ||
              elementForOptions.type === "select" ||
              elementForOptions.type === "radio"))
        ) {
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
                          onChange
                            ? onChange(newOptions)
                            : onUpdateProperty(i, "options", newOptions);
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
                          onChange
                            ? onChange(newOptions)
                            : onUpdateProperty(i, "options", newOptions);
                        }}
                        className="w-full p-2 border rounded"
                        placeholder="Option key"
                      />
                    </div>
                    <button
                      onClick={(e) => {
                        if (index === 0) {
                          const newOptions = [...options];
                          newOptions[0] = { text: "Option 1", key: "KEY-1" };
                          onChange
                            ? onChange(newOptions)
                            : onUpdateProperty(i, "options", newOptions);
                        } else {
                          const newOptions = options.filter(
                            (_, i) => i !== index,
                          );
                          onChange
                            ? onChange(newOptions)
                            : onUpdateProperty(i, "options", newOptions);
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
                  onChange
                    ? onChange(newOptions)
                    : onUpdateProperty(i, "options", newOptions);
                }}
                className="w-full p-2 border-2 border-dashed rounded-md hover:bg-gray-50 transition-colors text-gray-500 mt-4"
              >
                Add +
              </button>
            </div>
          );
        }
        return null;
      default:
        return (
          <input
            type={typeof value === "number" ? "number" : "text"}
            value={value || ""}
            onChange={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const newValue =
                typeof value === "number"
                  ? Number(e.target.value)
                  : e.target.value;
              onChange
                ? onChange(newValue)
                : onUpdateProperty(i, key, newValue);
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
      {renderTableControls()}
      <h3 className="text-lg font-semibold mb-4">Table Properties</h3>
      {Object.entries(properties || {})
        .filter(([key]) => {
          if (element.type === "table") {
            return ![
              "rows",
              "columns",
              "borderStyle",
              "cells",
              "borderWidth",
              "borderColor",
              "borderRadius",
            ].includes(key);
          }
          if (
            ["text", "textarea", "number", "date", "time", "select"].includes(
              element.type,
            )
          ) {
            return !key.startsWith("input");
          }
          return true;
        })
        .map(([key, value]) => (
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
      {["text", "textarea", "number", "date", "time", "select"].includes(
        element.type,
      ) && (
        <div className="mt-4">
          <div className="flex items-center gap-4 mb-4">
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
          {inputStyleTab === "preview" && (
            <div className="space-y-4">
              <div className="mb-4">
                <label className="block text-sm font-medium">
                  Border Color
                </label>
                <input
                  type="color"
                  value={properties.inputBorderColor || "#000000"}
                  onChange={(e) =>
                    onUpdateProperty(i, "inputBorderColor", e.target.value)
                  }
                  className="w-full h-10 p-1 rounded border"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">
                  Border Radius
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={properties.inputBorderRadius || 0}
                  onChange={(e) =>
                    onUpdateProperty(
                      i,
                      "inputBorderRadius",
                      Number(e.target.value),
                    )
                  }
                  className="w-full p-2 border rounded text-center"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">
                  Border Width (px)
                </label>
                <input
                  type="number"
                  min="0"
                  value={properties.inputBorderWidth || 1}
                  onChange={(e) =>
                    onUpdateProperty(
                      i,
                      "inputBorderWidth",
                      Number(e.target.value),
                    )
                  }
                  className="w-full p-2 border rounded text-center"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">
                  Text Alignment
                </label>
                <select
                  value={properties.inputTextAlign || "left"}
                  onChange={(e) =>
                    onUpdateProperty(i, "inputTextAlign", e.target.value)
                  }
                  className="w-full p-2 border rounded"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">
                  Font Size (px)
                </label>
                <input
                  type="number"
                  min="1"
                  value={properties.inputFontSize || 14}
                  onChange={(e) =>
                    onUpdateProperty(i, "inputFontSize", Number(e.target.value))
                  }
                  className="w-full p-2 border rounded text-center"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Font Style</label>
                <select
                  value={properties.inputFontStyle || "normal"}
                  onChange={(e) =>
                    onUpdateProperty(i, "inputFontStyle", e.target.value)
                  }
                  className="w-full p-2 border rounded"
                >
                  <option value="normal">Normal</option>
                  <option value="italic">Italic</option>
                  <option value="oblique">Oblique</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Font Weight</label>
                <select
                  value={properties.inputFontWeight || "normal"}
                  onChange={(e) =>
                    onUpdateProperty(i, "inputFontWeight", e.target.value)
                  }
                  className="w-full p-2 border rounded"
                >
                  <option value="normal">Normal</option>
                  <option value="bold">Bold</option>
                  <option value="bolder">Bolder</option>
                  <option value="lighter">Lighter</option>
                  <option value="100">100</option>
                  <option value="200">200</option>
                  <option value="300">300</option>
                  <option value="400">400</option>
                  <option value="500">500</option>
                  <option value="600">600</option>
                  <option value="700">700</option>
                  <option value="800">800</option>
                  <option value="900">900</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Font Color</label>
                <input
                  type="color"
                  value={properties.inputFontColor || "#000000"}
                  onChange={(e) =>
                    onUpdateProperty(i, "inputFontColor", e.target.value)
                  }
                  className="w-full h-10 p-1 rounded border"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">
                  Border Style
                </label>
                <select
                  value={properties.inputBorderStyle || "solid"}
                  onChange={(e) =>
                    onUpdateProperty(i, "inputBorderStyle", e.target.value)
                  }
                  className="w-full p-2 border rounded"
                >
                  <option value="solid">Solid</option>
                  <option value="dashed">Dashed</option>
                  <option value="dotted">Dotted</option>
                  <option value="double">Double</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">
                  Input Height (px)
                </label>
                <input
                  type="number"
                  min="1"
                  value={properties.inputHeight || 40}
                  onChange={(e) =>
                    onUpdateProperty(i, "inputHeight", Number(e.target.value))
                  }
                  className="w-full p-2 border rounded text-center"
                />
              </div>
            </div>
          )}
          {inputStyleTab === "pdf" && (
            <div className="space-y-4">
              <div className="mb-4">
                <label className="block text-sm font-medium">
                  Border Color (PDF)
                </label>
                <input
                  type="color"
                  value={properties.inputBorderColorPDF || "#000000"}
                  onChange={(e) =>
                    onUpdateProperty(i, "inputBorderColorPDF", e.target.value)
                  }
                  className="w-full h-10 p-1 rounded border"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">
                  Border Radius (PDF)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={properties.inputBorderRadiusPDF || 0}
                  onChange={(e) =>
                    onUpdateProperty(
                      i,
                      "inputBorderRadiusPDF",
                      Number(e.target.value),
                    )
                  }
                  className="w-full p-2 border rounded text-center"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">
                  Border Width (PDF) (px)
                </label>
                <input
                  type="number"
                  min="0"
                  value={properties.inputBorderWidthPDF || 1}
                  onChange={(e) =>
                    onUpdateProperty(
                      i,
                      "inputBorderWidthPDF",
                      Number(e.target.value),
                    )
                  }
                  className="w-full p-2 border rounded text-center"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">
                  Text Alignment (PDF)
                </label>
                <select
                  value={properties.inputTextAlignPDF || "left"}
                  onChange={(e) =>
                    onUpdateProperty(i, "inputTextAlignPDF", e.target.value)
                  }
                  className="w-full p-2 border rounded"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">
                  Font Size (PDF) (px)
                </label>
                <input
                  type="number"
                  min="1"
                  value={properties.inputFontSizePDF || 14}
                  onChange={(e) =>
                    onUpdateProperty(
                      i,
                      "inputFontSizePDF",
                      Number(e.target.value),
                    )
                  }
                  className="w-full p-2 border rounded text-center"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">
                  Font Style (PDF)
                </label>
                <select
                  value={properties.inputFontStylePDF || "normal"}
                  onChange={(e) =>
                    onUpdateProperty(i, "inputFontStylePDF", e.target.value)
                  }
                  className="w-full p-2 border rounded"
                >
                  <option value="normal">Normal</option>
                  <option value="italic">Italic</option>
                  <option value="oblique">Oblique</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">
                  Font Weight (PDF)
                </label>
                <select
                  value={properties.inputFontWeightPDF || "normal"}
                  onChange={(e) =>
                    onUpdateProperty(i, "inputFontWeightPDF", e.target.value)
                  }
                  className="w-full p-2 border rounded"
                >
                  <option value="normal">Normal</option>
                  <option value="bold">Bold</option>
                  <option value="bolder">Bolder</option>
                  <option value="lighter">Lighter</option>
                  <option value="100">100</option>
                  <option value="200">200</option>
                  <option value="300">300</option>
                  <option value="400">400</option>
                  <option value="500">500</option>
                  <option value="600">600</option>
                  <option value="700">700</option>
                  <option value="800">800</option>
                  <option value="900">900</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">Font Color</label>
                <input
                  type="color"
                  value={properties.inputFontColorPDF || "#000000"}
                  onChange={(e) =>
                    onUpdateProperty(i, "inputFontColorPDF", e.target.value)
                  }
                  className="w-full h-10 p-1 rounded border"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">
                  Border Style
                </label>
                <select
                  value={properties.inputBorderStylePDF || "solid"}
                  onChange={(e) =>
                    onUpdateProperty(i, "inputBorderStylePDF", e.target.value)
                  }
                  className="w-full p-2 border rounded"
                >
                  <option value="solid">Solid</option>
                  <option value="dashed">Dashed</option>
                  <option value="dotted">Dotted</option>
                  <option value="double">Double</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium">
                  Input Height (px)
                </label>
                <input
                  type="number"
                  min="1"
                  value={properties.inputHeightPDF || 40}
                  onChange={(e) =>
                    onUpdateProperty(
                      i,
                      "inputHeightPDF",
                      Number(e.target.value),
                    )
                  }
                  className="w-full p-2 border rounded text-center"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
