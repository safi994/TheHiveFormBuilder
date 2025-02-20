import React, { useState } from "react";
import { FormElement } from "../types";
import { Input } from "@/components/ui/input";
import { TableCellGrid } from "./TableCellGrid";
import { TableCellPropertyPanel } from "./TableCellPropertyPanel";

interface TableBasicPanelProps {
  element: FormElement;
  onUpdateProperty: (elementId: string, property: string, value: any) => void;
  onFormValueChange?: (elementId: string, value: any) => void;
}

/**
 * TableBasicPanel
 * ---------------
 * Renders the “basic” tab of the table (rows/columns controls, 
 * the cell grid, and the cell property panel if a cell is selected).
 */
export const TableBasicPanel: React.FC<TableBasicPanelProps> = ({
  element,
  onUpdateProperty,
  onFormValueChange,
}) => {
  const { properties, i } = element;
  const [selectedCell, setSelectedCell] = useState("");

  // Helper to return an initial cell size if none is set
  const getDefaultCellSize = () => {
    return 12 / (properties.columns || 1);
  };

  /**
   * Reset all cells to the same size (based on # of columns)
   */
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

  return (
    <div className="space-y-4">
      {/* Rows / Columns Controls */}
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
                  Math.max(1, (properties.rows || 1) - 1)
                )
              }
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              -
            </button>
            <Input
              type="number"
              min={1}
              value={properties.rows || 1}
              onChange={(e) =>
                onUpdateProperty(
                  i,
                  "rows",
                  Math.max(1, parseInt(e.target.value) || 1)
                )
              }
              className="w-16 text-center"
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
                  Math.max(1, (properties.columns || 1) - 1)
                )
              }
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              -
            </button>
            <Input
              type="number"
              min={1}
              value={properties.columns || 1}
              onChange={(e) =>
                onUpdateProperty(
                  i,
                  "columns",
                  Math.max(1, parseInt(e.target.value) || 1)
                )
              }
              className="w-16 text-center"
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

      {/* The visual grid of cells + row/column deletes */}
      <TableCellGrid
        element={element}
        selectedCell={selectedCell}
        setSelectedCell={setSelectedCell}
        onUpdateProperty={onUpdateProperty}
      />

      {/* Reset Cells to Same Size button */}
      <div className="mb-4">
        <button
          onClick={handleCellsSameSize}
          className="w-full py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium rounded-lg shadow-md transition-all duration-200 hover:from-blue-600 hover:to-indigo-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Reset Cells to Same Size
        </button>
      </div>

      {/* If a cell is selected, show the property panel for that cell */}
      {selectedCell && (
        <TableCellPropertyPanel
          element={element}
          selectedCell={selectedCell}
          onFormValueChange={onFormValueChange}
          onUpdateProperty={onUpdateProperty}
        />
      )}
    </div>
  );
};
