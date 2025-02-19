import React from "react";
import { FormElementProps } from "../../types";
import { PreviewElement } from "../PreviewElement";

/**
 * A table component that draws each cell's borders:
 *  - Left border only if colIndex === 0
 *  - Right border for all columns (thus including the last col => outer edge)
 *  - Top border only if rowIndex === 0
 *  - Bottom border for all rows (including last row => outer edge)
 *
 * This way, we get a full grid with outer borders, and no double lines.
 */
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
    borderWidth = 1, // The universal line thickness
    borderColor = "#6b7280", // Fallback color if a cell has no custom color
    borderStyle = "solid", // e.g. 'solid', 'dashed', 'dotted'
    cells = {},
  } = properties;

  return (
    <div
      style={{
        // Optional outer wrapper
        borderRadius: properties.borderRadius || 0,
        overflow: "hidden",
      }}
    >
      <table className="w-full border-collapse">
        <tbody>
          {Array.from({ length: rows }).map((_, rowIndex) => {
            // All cell keys in this row
            const rowCells = Array.from({ length: columns }).map(
              (_, colIndex) => `${rowIndex}-${colIndex}`,
            );
            // Normalize widths so they total 12
            distributeCellSizes(rowCells, cells, columns);

            return (
              <tr key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => {
                  const cellKey = `${rowIndex}-${colIndex}`;
                  // Skip overshadowed cells (colspan logic)
                  if (isSkippedCell(cellKey, cells, columns)) return null;

                  // Colspan logic
                  const colspanRight = cells[cellKey]?.style?.colspanRight || 0;
                  const colspanLeft = cells[cellKey]?.style?.colspanLeft || 0;
                  const colspan = colspanRight + colspanLeft + 1;

                  // How many of the 12 "grid units" this cell takes
                  const cellSize = cells[cellKey]?.style?.size || 12 / columns;
                  const cellStyle = cells[cellKey]?.style || {};

                  // Decide each edge's border width (to avoid double lines)
                  //  - Left border only if colIndex === 0
                  //  - Right border always => ensures a boundary on the far-right
                  //  - Top border only if rowIndex === 0
                  //  - Bottom border always => ensures a boundary on the bottom
                  const leftBorderWidth = colIndex === 0 ? borderWidth : 0;
                  const rightBorderWidth = borderWidth;
                  const topBorderWidth = rowIndex === 0 ? borderWidth : 0;
                  const bottomBorderWidth = borderWidth;

                  // Decide each edge's border color (fallback to table borderColor if undefined)
                  // If you want to "own" the edge only for colIndex < columns-1, you'd do that
                  // but here we let each cell always draw its right/bottom edges.
                  const leftBorderColor =
                    colIndex === 0
                      ? (cellStyle.leftBorderColor ?? borderColor)
                      : "transparent";
                  const rightBorderColor =
                    cellStyle.rightBorderColor ?? borderColor;
                  const topBorderColor =
                    rowIndex === 0
                      ? (cellStyle.topBorderColor ?? borderColor)
                      : "transparent";
                  const bottomBorderColor =
                    cellStyle.bottomBorderColor ?? borderColor;

                  return (
                    <td
                      key={cellKey}
                      colSpan={colspan}
                      style={{
                        borderStyle, // can remain uniform or vary per cell if you store it in style
                        // Left border
                        borderLeftWidth: leftBorderWidth,
                        borderLeftColor: leftBorderColor,
                        // Right border
                        borderRightWidth: rightBorderWidth,
                        borderRightColor: rightBorderColor,
                        // Top border
                        borderTopWidth: topBorderWidth,
                        borderTopColor: topBorderColor,
                        // Bottom border
                        borderBottomWidth: bottomBorderWidth,
                        borderBottomColor: bottomBorderColor,
                        backgroundColor: cellStyle.backgroundColor,
                        padding: `${cellStyle.padding ?? 8}px`,
                        width: `${(cellSize / 12) * 100}%`,
                      }}
                    >
                      {cells[cellKey] ? (
                        <PreviewElement
                          element={cells[cellKey]}
                          value={value?.[cellKey]}
                          onChange={
                            !readOnly && onChange
                              ? (newValue) =>
                                  onChange({
                                    ...(value || {}),
                                    [cellKey]: newValue,
                                  })
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

/**
 * Helper: normalize sizes so each row sums to 12 "grid units".
 * Same logic you had before.
 */
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

/**
 * Helper: skip overshadowed cells (colspan logic).
 */
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
