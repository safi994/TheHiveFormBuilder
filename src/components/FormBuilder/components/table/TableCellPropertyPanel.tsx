import React, { useState } from "react";
import { RegularPropertyPanel } from "../RegularPropertyPanel";
import { ELEMENT_TYPES } from "@/components/FormBuilder/constants";
import { FormElement } from "../../types";

// From your UI library:
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

interface TableCellPropertyPanelProps {
  element: FormElement;
  selectedCell: string;
  onUpdateProperty: (elementId: string, property: string, value: any) => void;
  onFormValueChange?: (elementId: string, value: any) => void;
}

/**
 * TableCellPropertyPanel
 * ----------------------
 * Displays the property panel for a selected cell. Allows changing the
 * cell’s element type, plus style adjustments (background, border, colspan, etc.).
 */
export const TableCellPropertyPanel: React.FC<TableCellPropertyPanelProps> = ({
  element,
  selectedCell,
  onUpdateProperty,
  onFormValueChange,
}) => {
  const { properties, i } = element;

  // Sub-tabs: “element” or “style”
  const [cellActiveTab, setCellActiveTab] = useState<"element" | "style">(
    "element",
  );
  // For the “element” tab, we may have further sub-tabs: “basic”, “logic”, “config”, “validation”
  const [cellElementActiveTab, setCellElementActiveTab] = useState("basic");
  // For border style toggles (preview/pdf)
  const [borderStyleTab, setBorderStyleTab] = useState<"preview" | "pdf">(
    "preview",
  );

  // Helper to compute default cell size
  const getDefaultCellSize = () => {
    return 12 / (properties.columns || 1);
  };

  /**
   * handleCellSizeChange:
   * If you want to do dynamic reflow, you can handle it here,
   * or you can keep it simpler and just set the size.
   * The advanced reflow logic can remain in TableBasicPanel if desired.
   */
  const handleCellSizeChange = (newSize: number) => {
    const updatedCells = { ...properties.cells };
    const cellData = updatedCells[selectedCell];
    if (!cellData) return;
    updatedCells[selectedCell] = {
      ...cellData,
      style: {
        ...cellData.style,
        size: newSize,
      },
    };
    onUpdateProperty(i, "cells", updatedCells);
  };

  // If there's no cell data yet, skip
  const cellData = properties.cells?.[selectedCell];
  if (!cellData) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Select Element Type */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Select Element Type</label>
        <select
          className="w-full p-2 border rounded"
          value={cellData.type || ""}
          onChange={(e) => {
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

      {/* Only show the rest if we actually have a type */}
      {cellData.type && (
        <div className="border-t pt-4">
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Cell Element Properties</h4>

            {/* Sub-tabs: “element” or “style” */}
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

            {/* If we’re on the “element” sub-tab, show the RegularPropertyPanel with its own sub-tabs */}
            {cellActiveTab === "element" ? (
              <div>
                {/* Inner sub-tabs for the element itself */}
                <div className="flex bg-gray-100 p-1 rounded-md mb-4">
                  {["basic", "logic", "config", "validation"].map((tab) => (
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
                  ))}
                </div>

                <RegularPropertyPanel
                  element={cellData}
                  onUpdateProperty={(elementId, property, value) => {
                    const updatedCellContent = {
                      ...cellData,
                      properties: {
                        ...cellData.properties,
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
              // If we’re on the “style” sub-tab
              <div className="space-y-4">
                {/* Background Color */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    Background Color
                  </label>
                  <input
                    type="color"
                    value={cellData.style?.backgroundColor || "#ffffff"}
                    onChange={(e) => {
                      const updatedCells = {
                        ...properties.cells,
                        [selectedCell]: {
                          ...cellData,
                          style: {
                            ...cellData.style,
                            backgroundColor: e.target.value,
                          },
                        },
                      };
                      onUpdateProperty(i, "cells", updatedCells);
                    }}
                    className="w-full h-10 p-1 rounded border"
                  />
                </div>

                {/* Border Style Tabs: Preview vs PDF */}
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

                  {/* Left/Right/Top/Bottom border colors */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Left Border Color */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">
                        Left Border Color
                      </label>
                      <input
                        type="color"
                        value={
                          cellData.style?.[
                            borderStyleTab === "pdf"
                              ? "leftBorderColorPDF"
                              : "leftBorderColor"
                          ] || "#d1d5db"
                        }
                        onChange={(e) => {
                          const updatedCells = {
                            ...properties.cells,
                            [selectedCell]: {
                              ...cellData,
                              style: {
                                ...cellData.style,
                                [borderStyleTab === "pdf"
                                  ? "leftBorderColorPDF"
                                  : "leftBorderColor"]: e.target.value,
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
                          cellData.style?.[
                            borderStyleTab === "pdf"
                              ? "rightBorderColorPDF"
                              : "rightBorderColor"
                          ] || "#d1d5db"
                        }
                        onChange={(e) => {
                          const updatedCells = {
                            ...properties.cells,
                            [selectedCell]: {
                              ...cellData,
                              style: {
                                ...cellData.style,
                                [borderStyleTab === "pdf"
                                  ? "rightBorderColorPDF"
                                  : "rightBorderColor"]: e.target.value,
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
                          cellData.style?.[
                            borderStyleTab === "pdf"
                              ? "topBorderColorPDF"
                              : "topBorderColor"
                          ] || "#d1d5db"
                        }
                        onChange={(e) => {
                          const updatedCells = {
                            ...properties.cells,
                            [selectedCell]: {
                              ...cellData,
                              style: {
                                ...cellData.style,
                                [borderStyleTab === "pdf"
                                  ? "topBorderColorPDF"
                                  : "topBorderColor"]: e.target.value,
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
                          cellData.style?.[
                            borderStyleTab === "pdf"
                              ? "bottomBorderColorPDF"
                              : "bottomBorderColor"
                          ] || "#d1d5db"
                        }
                        onChange={(e) => {
                          const updatedCells = {
                            ...properties.cells,
                            [selectedCell]: {
                              ...cellData,
                              style: {
                                ...cellData.style,
                                [borderStyleTab === "pdf"
                                  ? "bottomBorderColorPDF"
                                  : "bottomBorderColor"]: e.target.value,
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
                      <Input
                        type="number"
                        min={0}
                        max={(() => {
                          const [r, c] = selectedCell.split("-").map(Number);
                          return c; // can’t colspan left more than its own column index
                        })()}
                        value={cellData.style?.colspanLeft || 0}
                        onChange={(e) => {
                          const updatedCells = { ...properties.cells };
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
                      <Input
                        type="number"
                        min={0}
                        max={
                          (properties.columns || 1) -
                          Number(selectedCell.split("-")[1]) -
                          1
                        }
                        value={cellData.style?.colspanRight || 0}
                        onChange={(e) => {
                          const newVal = Number(e.target.value);
                          const updatedCells = { ...properties.cells };
                          updatedCells[selectedCell] = {
                            ...cellData,
                            style: {
                              ...cellData.style,
                              colspanRight: newVal,
                              // Optionally adjust the “size” if you want
                              size: getDefaultCellSize() * (newVal + 1),
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
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Slider
                          value={[cellData.style?.size || getDefaultCellSize()]}
                          min={1}
                          max={12}
                          step={0.1}
                          onValueChange={([val]) => handleCellSizeChange(val)}
                        />
                      </div>
                      <div className="w-20">
                        <Input
                          type="number"
                          min={1}
                          max={12}
                          step={0.1}
                          value={cellData.style?.size || getDefaultCellSize()}
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
                    <label className="block text-sm font-medium">Padding</label>
                    <div className="relative">
                      <Input
                        type="number"
                        min={0}
                        max={48}
                        value={cellData.style?.padding ?? 8}
                        onChange={(e) => {
                          const updatedCells = { ...properties.cells };
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
  );
};
