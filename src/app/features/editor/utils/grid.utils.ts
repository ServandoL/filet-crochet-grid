/** Build the string key used in the sparse Set. */
export function cellKey(row: number, col: number): string {
  return `${row},${col}`;
}

/** Toggle a single cell — returns a new Set. */
export function toggleCell(cells: Set<string>, row: number, col: number): Set<string> {
  const next = new Set(cells);
  const key = cellKey(row, col);
  if (next.has(key)) {
    next.delete(key);
  } else {
    next.add(key);
  }
  return next;
}

/** True when every cell in the row is filled. */
export function isRowFull(cells: Set<string>, row: number, cols: number): boolean {
  for (let c = 0; c < cols; c++) {
    if (!cells.has(cellKey(row, c))) return false;
  }
  return true;
}

/**
 * Camp A fill-first:
 *   - If row is fully filled → clear all cells in it.
 *   - Otherwise (empty or partial) → fill all cells in it.
 * Returns a new Set.
 */
export function fillRow(cells: Set<string>, row: number, cols: number): Set<string> {
  const next = new Set(cells);
  if (isRowFull(cells, row, cols)) {
    for (let c = 0; c < cols; c++) next.delete(cellKey(row, c));
  } else {
    for (let c = 0; c < cols; c++) next.add(cellKey(row, c));
  }
  return next;
}

/** Clear all cells in a row — returns a new Set. */
export function clearRow(cells: Set<string>, row: number, cols: number): Set<string> {
  const next = new Set(cells);
  for (let c = 0; c < cols; c++) next.delete(cellKey(row, c));
  return next;
}

/** True when every cell in the column is filled. */
export function isColFull(cells: Set<string>, col: number, rows: number): boolean {
  for (let r = 0; r < rows; r++) {
    if (!cells.has(cellKey(r, col))) return false;
  }
  return true;
}

/**
 * Camp A fill-first for columns:
 *   - If column is fully filled → clear all cells in it.
 *   - Otherwise → fill all cells in it.
 * Returns a new Set.
 */
export function fillCol(cells: Set<string>, col: number, rows: number): Set<string> {
  const next = new Set(cells);
  if (isColFull(cells, col, rows)) {
    for (let r = 0; r < rows; r++) next.delete(cellKey(r, col));
  } else {
    for (let r = 0; r < rows; r++) next.add(cellKey(r, col));
  }
  return next;
}

/** Clear all cells in a column — returns a new Set. */
export function clearCol(cells: Set<string>, col: number, rows: number): Set<string> {
  const next = new Set(cells);
  for (let r = 0; r < rows; r++) next.delete(cellKey(r, col));
  return next;
}

