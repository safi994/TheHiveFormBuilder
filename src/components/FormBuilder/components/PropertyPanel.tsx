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
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (
      element.properties.maxSize &&
      file.size > element.properties.maxSize * 1024 * 1024
    ) {
      alert(`Image size must be less than ${element.properties.maxSize}MB`);
      return;
    }

    const url = URL.createObjectURL(file);
    const imageData = { file, url };
    onFormValueChange(element.i, imageData);
    onUpdateProperty(element.i, "image", imageData);
  };

  const [selectedCell, setSelectedCell] = React.useState("");
  const [activeTab, setActiveTab] = React.useState("style");

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
                    element.i,
                    "rows",
                    Math.max(1, (element.properties.rows || 1) - 1),
                  )
                }
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                value={element.properties.rows || 1}
                onChange={(e) =>
                  onUpdateProperty(
                    element.i,
                    "rows",
                    Math.max(1, parseInt(e.target.value) || 1),
                  )
                }
                className="w-16 text-center p-2 border rounded-md"
              />
              <button
                onClick={() =>
                  onUpdateProperty(
                    element.i,
                    "rows",
                    (element.properties.rows || 1) + 1,
                  )
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
                    element.i,
                    "columns",
                    Math.max(1, (element.properties.columns || 1) - 1),
                  )
                }
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                value={element.properties.columns || 1}
                onChange={(e) =>
                  onUpdateProperty(
                    element.i,
                    "columns",
                    Math.max(1, parseInt(e.target.value) || 1),
                  )
                }
                className="w-16 text-center p-2 border rounded-md"
              />
              <button
                onClick={() =>
                  onUpdateProperty(
                    element.i,
                    "columns",
                    (element.properties.columns || 1) + 1,
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
          <label className="block text-sm font-medium">
            Add Element to Cell
          </label>
          <div className="grid grid-cols-1 gap-2">
            <select
              className="w-full p-2 border rounded mb-4"
              value={selectedCell}
              onChange={(e) => setSelectedCell(e.target.value)}
            >
              <option value="">Select cell</option>
              {Array.from({ length: element.properties.rows || 1 }).map(
                (_, row) =>
                  Array.from({
                    length: element.properties.columns || 1,
                  }).map((_, col) => {
                    const cellKey = `${row}-${col}`;

                    // Check if cell is part of any colspan
                    let isReserved = false;
                    let reservedBy = "";

                    // Check if part of a right colspan
                    for (
                      let i = 1;
                      i <= (element.properties.columns || 1);
                      i++
                    ) {
                      const prevCell = `${row}-${col - i}`;
                      if (
                        element.properties.cells?.[prevCell]?.style
                          ?.colspanRight >= i
                      ) {
                        isReserved = true;
                        reservedBy = `Cell (${row + 1}, ${col - i + 1})`;
                        break;
                      }
                    }

                    // Check if part of a left colspan
                    if (!isReserved) {
                      for (
                        let i = 1;
                        i <= (element.properties.columns || 1);
                        i++
                      ) {
                        const nextCell = `${row}-${col + i}`;
                        if (
                          element.properties.cells?.[nextCell]?.style
                            ?.colspanLeft >= i
                        ) {
                          isReserved = true;
                          reservedBy = `Cell (${row + 1}, ${col + i + 1})`;
                          break;
                        }
                      }
                    }

                    return (
                      <option
                        key={`${row}-${col}`}
                        value={`${row}-${col}`}
                        disabled={isReserved}
                      >
                        Cell ({row + 1}, {col + 1})
                        {isReserved ? ` (Reserved by ${reservedBy})` : ""}
                      </option>
                    );
                  }),
              )}
            </select>

            {selectedCell && (
              <div className="space-y-4">
                <div className="flex bg-gray-100 p-1 rounded-md">
                  <button
                    onClick={() => setActiveTab("style")}
                    className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === "style" ? "bg-white shadow-sm text-blue-600" : "text-gray-600 hover:text-gray-900 hover:bg-white/50"}`}
                  >
                    Cell Style
                  </button>
                  <button
                    onClick={() => setActiveTab("element")}
                    className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === "element" ? "bg-white shadow-sm text-blue-600" : "text-gray-600 hover:text-gray-900 hover:bg-white/50"}`}
                  >
                    Cell Element
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
                          element.properties.cells?.[selectedCell]?.style
                            ?.backgroundColor || "#ffffff"
                        }
                        onChange={(e) => {
                          const updatedCells = {
                            ...element.properties.cells,
                            [selectedCell]: {
                              ...element.properties.cells?.[selectedCell],
                              style: {
                                ...element.properties.cells?.[selectedCell]
                                  ?.style,
                                backgroundColor: e.target.value,
                              },
                            },
                          };
                          onUpdateProperty(element.i, "cells", updatedCells);
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
                              element.properties.cells?.[selectedCell]?.style
                                ?.colspanLeft || 0
                            }
                            onChange={(e) => {
                              const updatedCells = {
                                ...element.properties.cells,
                                [selectedCell]: {
                                  ...element.properties.cells?.[selectedCell],
                                  style: {
                                    ...element.properties.cells?.[selectedCell]
                                      ?.style,
                                    colspanLeft: Number(e.target.value),
                                  },
                                },
                              };
                              onUpdateProperty(
                                element.i,
                                "cells",
                                updatedCells,
                              );
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
                              return element.properties.columns - col - 1;
                            })()}
                            value={
                              element.properties.cells?.[selectedCell]?.style
                                ?.colspanRight || 0
                            }
                            onChange={(e) => {
                              const newColspanRight = Number(e.target.value);
                              const oldColspanRight =
                                element.properties.cells?.[selectedCell]?.style
                                  ?.colspanRight || 0;
                              const [row, col] = selectedCell
                                .split("-")
                                .map(Number);

                              // Get current cells
                              const currentCells = {
                                ...element.properties.cells,
                              };

                              // Calculate default cell size
                              const defaultCellSize =
                                12 / element.properties.columns;

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

                              onUpdateProperty(
                                element.i,
                                "cells",
                                updatedCells,
                              );
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
                          {(element.properties.columns || 1) <= 1 ? (
                            <span className="text-xs text-gray-500 ml-2">
                              Add more columns to adjust size
                            </span>
                          ) : (element.properties.cells?.[selectedCell]?.style
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
                                (element.properties.columns || 1) <= 1 ||
                                (element.properties.cells?.[selectedCell]?.style
                                  ?.colspanRight || 0) > 0
                              }
                              value={[
                                element.properties.cells?.[selectedCell]?.style
                                  ?.size ||
                                  (() => {
                                    // Calculate remaining space for cells without explicit size in this row
                                    const [row] = selectedCell
                                      .split("-")
                                      .map(Number);
                                    const rowCells = Array.from({
                                      length: element.properties.columns || 1,
                                    }).map((_, col) => `${row}-${col}`);
                                    const rowCellsWithSize = rowCells.filter(
                                      (key) =>
                                        element.properties.cells?.[key]?.style
                                          ?.size,
                                    );
                                    const totalExplicitSize =
                                      rowCellsWithSize.reduce(
                                        (sum, key) =>
                                          sum +
                                          (element.properties.cells[key]?.style
                                            ?.size || 0),
                                        0,
                                      );
                                    const remainingCells =
                                      rowCells.length - rowCellsWithSize.length;
                                    return remainingCells > 0
                                      ? (12 - totalExplicitSize) /
                                          remainingCells
                                      : 12 / (element.properties.columns || 1);
                                  })(),
                              ]}
                              min={1}
                              max={12}
                              step={1}
                              onValueChange={([value]) => {
                                const [row] = selectedCell
                                  .split("-")
                                  .map(Number);
                                const rowCells = Array.from({
                                  length: element.properties.columns || 1,
                                }).map((_, col) => `${row}-${col}`);

                                // Get current sizes
                                const currentSizes = rowCells.reduce(
                                  (acc, key) => {
                                    acc[key] =
                                      element.properties.cells?.[key]?.style
                                        ?.size ||
                                      12 / (element.properties.columns || 1);
                                    return acc;
                                  },
                                  {},
                                );

                                // Calculate how much space we need to take or give
                                const sizeDiff =
                                  value - currentSizes[selectedCell];

                                if (sizeDiff !== 0) {
                                  // Get other cells sorted by size (largest first for taking space)
                                  const otherCells = rowCells.filter(
                                    (key) => key !== selectedCell,
                                  );
                                  const sortedCells = otherCells.sort(
                                    (a, b) => currentSizes[b] - currentSizes[a],
                                  );

                                  if (sizeDiff > 0) {
                                    // Taking space from other cells
                                    let remainingToTake = sizeDiff;
                                    for (const cell of sortedCells) {
                                      const availableSpace = Math.max(
                                        0,
                                        currentSizes[cell] - 1,
                                      ); // Keep minimum of 1
                                      const takeFromThis = Math.min(
                                        availableSpace,
                                        remainingToTake,
                                      );
                                      if (takeFromThis > 0) {
                                        currentSizes[cell] -= takeFromThis;
                                        remainingToTake -= takeFromThis;
                                      }
                                      if (remainingToTake <= 0) break;
                                    }

                                    // If we can't take enough space, don't update
                                    if (remainingToTake > 0) return;
                                  } else {
                                    // Giving space to other cells
                                    const spaceToDistribute = -sizeDiff;
                                    const cellsToReceive = sortedCells.length;
                                    if (cellsToReceive > 0) {
                                      const spacePerCell =
                                        spaceToDistribute / cellsToReceive;
                                      sortedCells.forEach((cell) => {
                                        currentSizes[cell] += spacePerCell;
                                      });
                                    }
                                  }
                                }

                                // Update selected cell size
                                currentSizes[selectedCell] = value;

                                // Update all cells with new sizes
                                const updatedCells = {
                                  ...element.properties.cells,
                                };
                                Object.entries(currentSizes).forEach(
                                  ([key, size]) => {
                                    updatedCells[key] = {
                                      ...element.properties.cells?.[key],
                                      style: {
                                        ...element.properties.cells?.[key]
                                          ?.style,
                                        size,
                                      },
                                    };
                                  },
                                );

                                onUpdateProperty(
                                  element.i,
                                  "cells",
                                  updatedCells,
                                );
                              }}
                            />
                          </div>
                          <div className="w-12 text-center">
                            {element.properties.cells?.[selectedCell]?.style
                              ?.size ||
                              (() => {
                                // Calculate remaining space for cells without explicit size in this row
                                const [row] = selectedCell
                                  .split("-")
                                  .map(Number);
                                const rowCells = Array.from({
                                  length: element.properties.columns || 1,
                                }).map((_, col) => `${row}-${col}`);
                                const rowCellsWithSize = rowCells.filter(
                                  (key) =>
                                    element.properties.cells?.[key]?.style
                                      ?.size,
                                );
                                const totalExplicitSize =
                                  rowCellsWithSize.reduce(
                                    (sum, key) =>
                                      sum +
                                      (element.properties.cells[key]?.style
                                        ?.size || 0),
                                    0,
                                  );
                                const remainingCells =
                                  rowCells.length - rowCellsWithSize.length;
                                return remainingCells > 0
                                  ? (12 - totalExplicitSize) / remainingCells
                                  : 12 / (element.properties.columns || 1);
                              })()}
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
                              element.properties.cells?.[selectedCell]?.style
                                ?.padding || 8
                            }
                            onChange={(e) => {
                              const updatedCells = {
                                ...element.properties.cells,
                                [selectedCell]: {
                                  ...element.properties.cells?.[selectedCell],
                                  style: {
                                    ...element.properties.cells?.[selectedCell]
                                      ?.style,
                                    padding: Number(e.target.value),
                                  },
                                },
                              };
                              onUpdateProperty(
                                element.i,
                                "cells",
                                updatedCells,
                              );
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
                      value={
                        element.properties.cells?.[selectedCell]?.type || ""
                      }
                      onChange={(e) => {
                        if (!selectedCell) return;

                        const elementType = ELEMENT_TYPES.find(
                          (t) => t.id === e.target.value,
                        );
                        if (!elementType) return;

                        // Calculate default cell size based on remaining space
                        const [row] = selectedCell.split("-").map(Number);
                        const rowCells = Array.from({
                          length: element.properties.columns || 1,
                        }).map((_, col) => `${row}-${col}`);
                        const rowCellsWithSize = rowCells.filter(
                          (key) => element.properties.cells?.[key]?.style?.size,
                        );
                        const totalExplicitSize = rowCellsWithSize.reduce(
                          (sum, key) =>
                            sum +
                            (element.properties.cells[key]?.style?.size || 0),
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
                                (12 / (element.properties.columns || 1)) * 100,
                              ) / 100,
                        );

                        const newElement = {
                          i: `${element.i}-${selectedCell}`,
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

                        onUpdateProperty(element.i, "cells", {
                          ...element.properties.cells,
                          [selectedCell]: newElement,
                        });
                      }}
                    >
                      <option value="">Select element type</option>
                      {ELEMENT_TYPES.filter(
                        (t) => !t.advanced && t.id !== "table",
                      ).map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.label}
                        </option>
                      ))}
                    </select>

                    {element.properties.cells?.[selectedCell] && (
                      <div className="border-t pt-4">
                        <h4 className="text-sm font-medium mb-4">
                          Cell Element Properties
                        </h4>
                        {Object.entries(
                          element.properties.cells[selectedCell]?.properties ||
                            {},
                        ).map(([key, value]) => {
                          const cellElement =
                            element.properties.cells[selectedCell];
                          const showOptions =
                            ["checkbox", "radio", "select"].includes(
                              cellElement.type,
                            ) && key === "options";

                          return (
                            <div key={key} className="mb-4">
                              <label className="block text-sm font-medium capitalize">
                                {key.replace(/([A-Z])/g, " $1").trim()}
                              </label>
                              {renderPropertyInput(
                                key,
                                value,
                                (newValue) => {
                                  const updatedCellContent = {
                                    ...element.properties.cells[selectedCell],
                                    properties: {
                                      ...element.properties.cells[selectedCell]
                                        .properties,
                                      [key]: newValue,
                                    },
                                  };
                                  onUpdateProperty(element.i, "cells", {
                                    ...element.properties.cells,
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
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Border Width</label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="10"
                value={element.properties.borderWidth || 1}
                onChange={(e) =>
                  onUpdateProperty(
                    element.i,
                    "borderWidth",
                    Number(e.target.value),
                  )
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
              value={element.properties.borderColor || "#cccccc"}
              onChange={(e) =>
                onUpdateProperty(element.i, "borderColor", e.target.value)
              }
              className="w-full h-10 p-1 rounded border"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Border Style</label>
            <select
              value={element.properties.borderStyle || "solid"}
              onChange={(e) =>
                onUpdateProperty(element.i, "borderStyle", e.target.value)
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
                value={element.properties.borderRadius || 0}
                onChange={(e) =>
                  onUpdateProperty(
                    element.i,
                    "borderRadius",
                    Number(e.target.value),
                  )
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

    if (
      (element.type === "plainText" && key === "defaultText") ||
      (element.properties.cells?.[selectedCell]?.type === "plainText" &&
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
                : onUpdateProperty(element.i, key, newValue);
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
              onChange
                ? onChange(updatedValue)
                : onUpdateProperty(element.i, key, updatedValue);
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
                    : onUpdateProperty(element.i, key, newValue);
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
                  : onUpdateProperty(element.i, key, newValue);
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
              onChange
                ? onChange(checked)
                : onUpdateProperty(element.i, key, checked);
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
              onChange
                ? onChange(checked)
                : onUpdateProperty(element.i, key, checked);
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
                            : onUpdateProperty(
                                element.i,
                                "options",
                                newOptions,
                              );
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
                            : onUpdateProperty(
                                element.i,
                                "options",
                                newOptions,
                              );
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
                            : onUpdateProperty(
                                element.i,
                                "options",
                                newOptions,
                              );
                        } else {
                          const newOptions = options.filter(
                            (_, i) => i !== index,
                          );
                          onChange
                            ? onChange(newOptions)
                            : onUpdateProperty(
                                element.i,
                                "options",
                                newOptions,
                              );
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
                    : onUpdateProperty(element.i, "options", newOptions);
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
                : onUpdateProperty(element.i, key, newValue);
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
      <h3 className="text-lg font-semibold mb-4">
        {config.settings.propertyPanel.title}
      </h3>
      {Object.entries(element.properties || {})
        .filter(
          ([key]) =>
            !["rows", "columns", "borderStyle", "cells"].includes(key) ||
            element.type !== "table",
        )
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
    </div>
  );
};
