/**
 * isSkippedCell
 * -------------
 * Helper function to determine if a cellKey is "skipped" because
 * it falls under a colspan of a neighboring cell.
 */
export function isSkippedCell(cellKey: string, cells: any, columns: number) {
  const [row, col] = cellKey.split("-").map(Number);

  for (let i = 1; i <= columns; i++) {
    const prevCellKey = `${row}-${col - i}`;
    if (cells[prevCellKey]?.style?.colspanRight >= i) {
      return true;
    }
  }
  for (let i = 1; i <= columns; i++) {
    const nextCellKey = `${row}-${col + i}`;
    if (cells[nextCellKey]?.style?.colspanLeft >= i) {
      return true;
    }
  }
  return false;
}
