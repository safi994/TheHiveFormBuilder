import React, { useState } from "react";
import { FormElement } from "../types";
import { ELEMENT_TYPES } from "../constants";
import { RegularPropertyPanel } from "./RegularPropertyPanel";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

// Helper function from Table component
function isSkippedCell(cellKey: string, cells: any, columns: number) {
  const [row, col] = cellKey.split("-").map(Number);
  for (let i = 1; i <= columns; i++) {
    const prevCell = `${row}-${col - i}`;
    if (cells[prevCell]?.style?.colspanRight >= i) return true;
  }
  for (let i = 1; i <= columns; i++) {
    const nextCell = `${row}-${col + i}`;
    if (cells[nextCell]?.style?.colspanLeft >= i) return true;
  }
  return false;
}

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
  const [cellElementActiveTab, setCellElementActiveTab] = useState("basic");
  const [cellActiveTab, setCellActiveTab] = useState("element");
  const [borderStyleTab, setBorderStyleTab] = useState("preview");
  const [selectedCell, setSelectedCell] = useState("");

  // Helper: initial cell size if none is set
  const getDefaultCellSize = () => {
    return 12 / (properties.columns || 1);
  };

  /**
   * handleCellSizeChange:
   * Called when the user changes the size of the "selectedCell".
   * We adjust that cell's size and optionally reflow the difference
   * to the "last cell" in that row, preserving a total of 12 for that row.
   */
  const handleCellSizeChange = (newSize: number) => {
    if (!selectedCell) return;

    const updatedCells = { ...properties.cells };
    const [rowIndex, colIndex] = selectedCell.split("-").map(Number);
    const currentCell = updatedCells[selectedCell];
    if (!currentCell) return;

    // Old size or default
    const oldSize = currentCell.style?.size ?? 12 / (properties.columns || 1);
    const diff = newSize - oldSize;

    // Update the selected cell
    updatedCells[selectedCell] = {
      ...currentCell,
      style: {
        ...currentCell.style,
        size: newSize,
      },
    };

    // Decide on "locked cell" or "auto cell"
    const totalCols = properties.columns || 1;
    const lockedCellColIndex = 0; // example: first column is "locked"
    const autoCellColIndex = totalCols - 1; // last column is "auto"

    // If selected cell is the locked cell or the last cell, do no reflow
    if (colIndex === lockedCellColIndex || colIndex === autoCellColIndex) {
      // We won't reflow anything else
      onUpdateProperty(i, "cells", updatedCells);
      return;
    }

    // Otherwise, reflow the difference to the last cell in the same row
    const lastCellKey = `${rowIndex}-${autoCellColIndex}`;
    // Make sure that key is different from selectedCell
    if (updatedCells[lastCellKey] && lastCellKey !== selectedCell) {
      const lastCell = updatedCells[lastCellKey];
      const oldLastSize =
        lastCell.style?.size ?? 12 / (properties.columns || 1);
      const newLastSize = oldLastSize - diff; // preserve sum=12
      // Optionally clamp newLastSize between [1,12], or check for negative, etc.
      // if (newLastSize < 1) newLastSize = 1;
      // if (newLastSize > 12) newLastSize = 12;

      updatedCells[lastCellKey] = {
        ...lastCell,
        style: {
          ...lastCell.style,
          size: newLastSize,
        },
      };
    }

    // Commit changes
    onUpdateProperty(i, "cells", updatedCells);
  };
  // Add these DELETE FUNCTIONS inside your PropertyPanel component (e.g. after handleCellSizeChange)

  // DELETE FUNCTIONS

  const handleCellDelete = (cellKey: string) => {
    const updatedCells = { ...properties.cells };
    if (updatedCells[cellKey]) {
      delete updatedCells[cellKey];
      onUpdateProperty(i, "cells", updatedCells);
    }
  };

  const handleRowDelete = (rowIndex: number) => {
    const updatedCells = { ...properties.cells };
    const newCells: any = {};
    Object.keys(updatedCells).forEach((key) => {
      const [r, c] = key.split("-").map(Number);
      if (r === rowIndex) return; // skip deleted row
      const newRow = r > rowIndex ? r - 1 : r;
      newCells[`${newRow}-${c}`] = updatedCells[key];
    });
    onUpdateProperty(i, "cells", newCells);
    onUpdateProperty(i, "rows", Math.max(1, (properties.rows || 1) - 1));
    if (selectedCell && selectedCell.startsWith(`${rowIndex}-`))
      setSelectedCell("");
  };

  const handleColumnDelete = (colIndex: number) => {
    const updatedCells = { ...properties.cells };
    const newCells: any = {};
    Object.keys(updatedCells).forEach((key) => {
      const [r, c] = key.split("-").map(Number);
      if (c === colIndex) return; // skip deleted column
      const newCol = c > colIndex ? c - 1 : c;
      newCells[`${r}-${newCol}`] = updatedCells[key];
    });
    onUpdateProperty(i, "cells", newCells);
    onUpdateProperty(i, "columns", Math.max(1, (properties.columns || 1) - 1));
    if (selectedCell && selectedCell.split("-")[1] === String(colIndex))
      setSelectedCell("");
  };

  // Add this helper function inside your PropertyPanel component (e.g. after handleColumnDelete)
  const handleCellsSameSize = () => {
    const defaultSize = getDefaultCellSize();
    const updatedCells = { ...properties.cells };
    Object.keys(updatedCells).forEach((key) => {
      const cell = updatedCells[key];
      if (cell) {
        updatedCells[key] = {
          ...cell,
          style: {
            ...cell.style,
            size: defaultSize,
          },
        };
      }
    });
    onUpdateProperty(i, "cells", updatedCells);
  };
  // Provide a function to list the available cells for the user to pick
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
              {/* Border Width */}
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
                      onValueChange={([val]) =>
                        onUpdateProperty(i, "borderWidth", val)
                      }
                    />
                  </div>
                  <div className="w-20 relative">
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

              {/* Border Color */}
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

              {/* Border Style */}
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

              {/* Border Radius */}
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
                      onValueChange={([val]) =>
                        onUpdateProperty(i, "borderRadius", val)
                      }
                    />
                  </div>
                  <div className="w-20 relative">
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

    // If activeTab === "basic"
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Rows */}
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

          {/* Columns */}
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

        {/* Visual table cell selector with delete buttons */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Select a Cell</label>
          <div className="border rounded-lg p-2 bg-gray-50">
            {Array.from({ length: properties.rows || 1 }).map((_, rowIndex) => (
              <div key={`row-${rowIndex}`} className="flex items-center mb-1">
                {Array.from({ length: properties.columns || 1 }).map(
                  (_, colIndex) => {
                    const cellKey = `${rowIndex}-${colIndex}`;
                    const isSelected = selectedCell === cellKey;
                    const cell = properties.cells?.[cellKey];

                    // Skip cells that are part of a colspan
                    if (
                      isSkippedCell(
                        cellKey,
                        properties.cells || {},
                        properties.columns || 1,
                      )
                    ) {
                      return <div key={cellKey} className="flex-1"></div>;
                    }

                    return (
                      <div
                        key={cellKey}
                        className="relative group flex-1 mx-0.5"
                      >
                        <button
                          onClick={() => setSelectedCell(cellKey)}
                          className={`
                          w-full aspect-square rounded border transition-all
                          ${
                            isSelected
                              ? "border-primary bg-primary/10 shadow-sm"
                              : "border-gray-200 bg-white hover:border-primary/50 hover:bg-primary/5"
                          }
                          flex items-center justify-center text-xs font-medium
                        `}
                        >
                          {cell?.type ? (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="truncate px-1">
                                {cell.properties?.label?.text || cell.type}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400 animate-pulse">
                              Empty
                            </span>
                          )}
                        </button>
                        {/* Cell Content Delete: appears on hover if cell has content */}
                        {cell?.type && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCellDelete(cellKey);
                            }}
                            className="absolute top-1 right-1 bg-white shadow-md rounded-full text-red-500 w-6 h-6 flex items-center justify-center text-sm opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:bg-red-50"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    );
                  },
                )}
                {/* Row Delete Button */}
                <button
                  onClick={() => handleRowDelete(rowIndex)}
                  className="ml-1 bg-white shadow-md rounded-full text-red-500 w-6 h-6 flex items-center justify-center text-sm transition-colors duration-200 hover:bg-red-50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))}
            {/* Column Delete Buttons Row */}
            <div className="flex mt-1">
              {Array.from({ length: properties.columns || 1 }).map(
                (_, colIndex) => (
                  <div
                    key={`col-delete-${colIndex}`}
                    className="flex-1 flex justify-center mx-0.5"
                  >
                    <button
                      onClick={() => handleColumnDelete(colIndex)}
                      className="bg-white shadow-md rounded-full text-red-500 w-6 h-6 flex items-center justify-center text-sm transition-colors duration-200 hover:bg-red-50"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                ),
              )}
              {/* To account for row delete button space */}
              <div style={{ width: "1.5rem" }}></div>
            </div>
          </div>
        </div>
        {/* Cells Same Size Button */}
        <div className="mb-4">
          <div className="mb-4">
            <button
              onClick={handleCellsSameSize}
              className="w-full py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium rounded-lg shadow-md transition-all duration-200 hover:from-blue-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Reset Cells to Same Size
            </button>
          </div>
        </div>
        {selectedCell && (
          <div className="space-y-4">
            {/* Element type */}
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
                {ELEMENT_TYPES.filter(
                  (t) => !(t as any).advanced && t.id !== "table",
                ).map((type) => (
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

                  {/* element vs style tabs */}
                  <div className="flex bg-gray-100 p-1 rounded-md">
                    <button
                      onClick={() => setCellActiveTab("element")}
                      className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        cellActiveTab === "element"
                          ? "bg-white shadow-sm text-blue-600"
                          : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                      }`}
                    >
                      Cell Element
                    </button>
                    <button
                      onClick={() => setCellActiveTab("style")}
                      className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        cellActiveTab === "style"
                          ? "bg-white shadow-sm text-blue-600"
                          : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                      }`}
                    >
                      Cell Style
                    </button>
                  </div>

                  {cellActiveTab === "element" ? (
                    properties.cells?.[selectedCell]?.type ? (
                      <div>
                        {/* Additional tabs for the element (basic, logic, config, validation) */}
                        <div className="flex bg-gray-100 p-1 rounded-md mb-4">
                          {["basic", "logic", "config", "validation"].map(
                            (tab) => (
                              <button
                                key={tab}
                                onClick={() => setCellElementActiveTab(tab)}
                                className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                                  cellElementActiveTab === tab
                                    ? "bg-white shadow-sm text-blue-600"
                                    : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                                }`}
                              >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                              </button>
                            ),
                          )}
                        </div>

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
                          activeTab={cellElementActiveTab}
                        />
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500 border border-dashed rounded-md">
                        Please select an element to show its properties.
                      </div>
                    )
                  ) : (
                    // cellActiveTab === "style"
                    <div className="space-y-4">
                      {/* Background color */}
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

                      {/* Border style toggles (preview/pdf) */}
                      <div className="space-y-4">
                        <div className="flex bg-gray-100 p-1 rounded-md">
                          <button
                            onClick={() => setBorderStyleTab("preview")}
                            className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                              borderStyleTab === "preview"
                                ? "bg-white shadow-sm text-blue-600"
                                : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                            }`}
                          >
                            Cell Border Style (Preview)
                          </button>
                          <button
                            onClick={() => setBorderStyleTab("pdf")}
                            className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                              borderStyleTab === "pdf"
                                ? "bg-white shadow-sm text-blue-600"
                                : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                            }`}
                          >
                            Cell Border Style (PDF)
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {/* Left Border Color */}
                          <div className="space-y-2">
                            <label className="block text-sm font-medium">
                              Left Border Color
                            </label>
                            <input
                              type="color"
                              value={
                                properties.cells?.[selectedCell]?.style?.[
                                  `${
                                    borderStyleTab === "pdf"
                                      ? "leftBorderColorPDF"
                                      : "leftBorderColor"
                                  }`
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
                                      [`${
                                        borderStyleTab === "pdf"
                                          ? "leftBorderColorPDF"
                                          : "leftBorderColor"
                                      }`]: e.target.value,
                                    },
                                  },
                                };
                                onUpdateProperty(i, "cells", updatedCells);
                              }}
                              className="w-full h-10 p-1 rounded border"
                            />
                          </div>

                          {/* Right Border Color */}
                          <div className="space-y-2">
                            <label className="block text-sm font-medium">
                              Right Border Color
                            </label>
                            <input
                              type="color"
                              value={
                                properties.cells?.[selectedCell]?.style?.[
                                  `${
                                    borderStyleTab === "pdf"
                                      ? "rightBorderColorPDF"
                                      : "rightBorderColor"
                                  }`
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
                                      [`${
                                        borderStyleTab === "pdf"
                                          ? "rightBorderColorPDF"
                                          : "rightBorderColor"
                                      }`]: e.target.value,
                                    },
                                  },
                                };
                                onUpdateProperty(i, "cells", updatedCells);
                              }}
                              className="w-full h-10 p-1 rounded border"
                            />
                          </div>

                          {/* Top Border Color */}
                          <div className="space-y-2">
                            <label className="block text-sm font-medium">
                              Top Border Color
                            </label>
                            <input
                              type="color"
                              value={
                                properties.cells?.[selectedCell]?.style?.[
                                  `${
                                    borderStyleTab === "pdf"
                                      ? "topBorderColorPDF"
                                      : "topBorderColor"
                                  }`
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
                                      [`${
                                        borderStyleTab === "pdf"
                                          ? "topBorderColorPDF"
                                          : "topBorderColor"
                                      }`]: e.target.value,
                                    },
                                  },
                                };
                                onUpdateProperty(i, "cells", updatedCells);
                              }}
                              className="w-full h-10 p-1 rounded border"
                            />
                          </div>

                          {/* Bottom Border Color */}
                          <div className="space-y-2">
                            <label className="block text-sm font-medium">
                              Bottom Border Color
                            </label>
                            <input
                              type="color"
                              value={
                                properties.cells?.[selectedCell]?.style?.[
                                  `${
                                    borderStyleTab === "pdf"
                                      ? "bottomBorderColorPDF"
                                      : "bottomBorderColor"
                                  }`
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
                                      [`${
                                        borderStyleTab === "pdf"
                                          ? "bottomBorderColorPDF"
                                          : "bottomBorderColor"
                                      }`]: e.target.value,
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

                      {/* Colspan Left / Right */}
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
                                const updatedCells = { ...properties.cells };
                                const cellData = updatedCells[selectedCell];
                                updatedCells[selectedCell] = {
                                  ...cellData,
                                  style: {
                                    ...cellData.style,
                                    colspanLeft: Number(e.target.value),
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
                                return (properties.columns || 1) - col - 1;
                              })()}
                              value={
                                properties.cells?.[selectedCell]?.style
                                  ?.colspanRight || 0
                              }
                              onChange={(e) => {
                                const newColspanRight = Number(e.target.value);
                                const [row, col] = selectedCell
                                  .split("-")
                                  .map(Number);
                                const defaultCellSize =
                                  12 / (properties.columns || 1);
                                const updatedCells = { ...properties.cells };

                                const selectedCellData =
                                  updatedCells[selectedCell];
                                updatedCells[selectedCell] = {
                                  ...selectedCellData,
                                  style: {
                                    ...selectedCellData.style,
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

                      {/* Cell Size (1-12) */}
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
                                onValueChange={([val]) =>
                                  handleCellSizeChange(val)
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

                        {/* Padding */}
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
                                const updatedCells = { ...properties.cells };
                                const cellData = updatedCells[selectedCell];
                                updatedCells[selectedCell] = {
                                  ...cellData,
                                  style: {
                                    ...cellData.style,
                                    padding: Number(e.target.value),
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
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border sticky top-4">
      <h3 className="text-lg font-semibold mb-4">Properties</h3>

      {/* Top-level tabs: for a table, only show [basic, logic].
         Otherwise show [basic, logic, config, validation] */}
      <div className="flex bg-gray-100 p-1 rounded-md mb-4">
        {(element.type === "table"
          ? ["basic", "logic"]
          : ["basic", "logic", "config", "validation"]
        ).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeTab === tab
                ? "bg-white shadow-sm text-blue-600"
                : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
            }`}
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
