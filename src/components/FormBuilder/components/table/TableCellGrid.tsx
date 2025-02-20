import React from "react";
import { FormElement } from "../types";
import { isSkippedCell } from "../utils/tableUtils";

/**
 * Props for TableCellGrid
 */
interface TableCellGridProps {
  element: FormElement;
  selectedCell: string;
  setSelectedCell: (cellKey: string) => void;
  onUpdateProperty: (elementId: string, property: string, value: any) => void;
}

/**
 * TableCellGrid
 * -------------
 * Renders the clickable grid of cells, along with row/column delete buttons.
 */
export const TableCellGrid: React.FC<TableCellGridProps> = ({
  element,
  selectedCell,
  setSelectedCell,
  onUpdateProperty,
}) => {
  const { properties, i } = element;

  /**
   * handleCellDelete:
   * Removes the content of a single cell (making it empty).
   */
  const handleCellDelete = (cellKey: string) => {
    const updatedCells = { ...properties.cells };
    if (updatedCells[cellKey]) {
      delete updatedCells[cellKey];
      onUpdateProperty(i, "cells", updatedCells);
    }
  };

  /**
   * handleRowDelete:
   * Deletes an entire row, shifts subsequent rows up by 1, 
   * and decrements the row count.
   */
  const handleRowDelete = (rowIndex: number) => {
    const updatedCells = { ...properties.cells };
    const newCells: Record<string, any> = {};

    Object.keys(updatedCells).forEach((key) => {
      const [r, c] = key.split("-").map(Number);
      if (r === rowIndex) return; // skip this row
      const newRow = r > rowIndex ? r - 1 : r;
      newCells[`${newRow}-${c}`] = updatedCells[key];
    });

    onUpdateProperty(i, "cells", newCells);
    onUpdateProperty(i, "rows", Math.max(1, (properties.rows || 1) - 1));

    // Clear selection if it was in this row
    if (selectedCell && selectedCell.startsWith(`${rowIndex}-`)) {
      setSelectedCell("");
    }
  };

  /**
   * handleColumnDelete:
   * Deletes an entire column, shifts subsequent columns left by 1,
   * and decrements the column count.
   */
  const handleColumnDelete = (colIndex: number) => {
    const updatedCells = { ...properties.cells };
    const newCells: Record<string, any> = {};

    Object.keys(updatedCells).forEach((key) => {
      const [r, c] = key.split("-").map(Number);
      if (c === colIndex) return; // skip this column
      const newCol = c > colIndex ? c - 1 : c;
      newCells[`${r}-${newCol}`] = updatedCells[key];
    });

    onUpdateProperty(i, "cells", newCells);
    onUpdateProperty(i, "columns", Math.max(1, (properties.columns || 1) - 1));

    // Clear selection if it was in this column
    if (selectedCell && selectedCell.split("-")[1] === String(colIndex)) {
      setSelectedCell("");
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">Select a Cell</label>
      <div className="border rounded-lg p-2 bg-gray-50">
        {/* Rows */}
        {Array.from({ length: properties.rows || 1 }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="flex items-center mb-1">
            {/* Columns */}
            {Array.from({ length: properties.columns || 1 }).map((_, colIndex) => {
              const cellKey = `${rowIndex}-${colIndex}`;
              const isSelected = selectedCell === cellKey;
              const cell = properties.cells?.[cellKey];

              // Skip cells that are part of a colspan
              if (
                isSkippedCell(
                  cellKey,
                  properties.cells || {},
                  properties.columns || 1
                )
              ) {
                return <div key={cellKey} className="flex-1"></div>;
              }

              return (
                <div key={cellKey} className="relative group flex-1 mx-0.5">
                  <button
                    onClick={() => setSelectedCell(cellKey)}
                    className={`
                      w-full aspect-square rounded border transition-all
                      ${isSelected
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

                  {/* Delete cell content if present */}
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
            })}

            {/* Delete entire row button */}
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

        {/* Column delete buttons row */}
        <div className="flex mt-1">
          {Array.from({ length: properties.columns || 1 }).map((_, colIndex) => (
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
          ))}
          {/* Spacer for row-delete column */}
          <div style={{ width: "1.5rem" }}></div>
        </div>
      </div>
    </div>
  );
};
