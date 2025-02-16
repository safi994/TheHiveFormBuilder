import React from "react";
import { FormElementProps } from "../../types";
import { PreviewElement } from "../PreviewElement";

export const Table: React.FC<FormElementProps> = ({
  element,
  value = {} as Record<string, any>,
  onChange,
  readOnly,
}) => {
  const { properties } = element;
  const {
    rows = 1,
    columns = 1,
    borderWidth = 1,
    borderColor = "#6b7280",
    borderStyle = "solid",
    cells = {},
  } = properties;

  return (
    <div
      style={{
        borderWidth,
        borderColor,
        borderStyle,
        borderRadius: properties.borderRadius || 0,
        overflow: "hidden",
      }}
    >
      <table className="w-full border-collapse">
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => {
            const rowCells = Array.from({ length: columns }).map(
              (_, col) => `${rowIndex}-${col}`,
            );
            distributeCellSizes(rowCells, cells, columns);

            return (
              <tr key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => {
                  const cellKey = `${rowIndex}-${colIndex}`;
                  if (isSkippedCell(cellKey, cells, columns)) return null;

                  const colspanRight = cells[cellKey]?.style?.colspanRight || 0;
                  const colspanLeft = cells[cellKey]?.style?.colspanLeft || 0;
                  const colspan = colspanRight + colspanLeft + 1;
                  const cellSize = cells[cellKey]?.style?.size || 12 / columns;

                  return (
                    <td
                      key={cellKey}
                      colSpan={colspan}
                      style={{
                        borderRightWidth:
                          colIndex === columns - 1 ? 0 : borderWidth,
                        borderBottomWidth:
                          rowIndex === rows - 1 ? 0 : borderWidth,
                        borderLeftWidth: 0,
                        borderTopWidth: 0,
                        borderColor,
                        borderStyle,
                        backgroundColor: cells[cellKey]?.style?.backgroundColor,
                        padding: cells[cellKey]?.style?.padding
                          ? `${cells[cellKey].style.padding}px`
                          : "8px",
                        width: `${(cellSize / 12) * 100}%`,
                      }}
                    >
                      {cells[cellKey] ? (
                        <PreviewElement
                          element={cells[cellKey]}
                          value={value?.[cellKey]}
                          onChange={
                            !readOnly && onChange
                              ? (newValue) => {
                                  onChange({
                                    ...(value || {}),
                                    [cellKey]: newValue,
                                  });
                                }
                              : undefined
                          }
                          readOnly={readOnly}
                          isPreview={true}
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full min-h-[40px] text-gray-400">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect width="18" height="18" x="3" y="3" rx="2" />
                            <path d="M3 9h18" />
                            <path d="M9 21V9" />
                          </svg>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// Updated helper function to normalize cell sizes so that their total equals 12
function distributeCellSizes(
  rowCells: string[],
  cells: any,
  columns: number,
): void {
  const validCells = rowCells.filter(
    (key) => !isSkippedCell(key, cells, columns),
  );
  const n = validCells.length;
  const sizes = validCells.map((key) => {
    let s = cells[key]?.style?.size;
    if (s === undefined || s <= 0) {
      s = 12 / n;
    }
    return s;
  });
  const total = sizes.reduce((sum, s) => sum + s, 0);
  validCells.forEach((key, index) => {
    const normalized = Math.round((sizes[index] / total) * 12 * 10) / 10;
    if (!cells[key]) cells[key] = { style: {} };
    cells[key].style = { ...cells[key].style, size: normalized };
  });
}

// Helper function to check if a cell should be skipped (i.e. part of another cell's colspan)
const isSkippedCell = (
  cellKey: string,
  cells: any,
  columns: number,
): boolean => {
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
};
