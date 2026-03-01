export type FilledCell = [number, number];

export interface Pattern {
  _id: string;
  name: string;
  rows: number;
  cols: number;
  cells: FilledCell[];
  updatedAt: string;
  createdAt: string;
}

export interface CreatePatternDto {
  name: string;
  rows: number;
  cols: number;
}

export interface UpdatePatternDto {
  name?: string;
  cells?: FilledCell[];
}

/** Progress tracking — satellite document; _id matches the parent Pattern._id */
export interface Progress {
  _id: string;
  highlightedCells: FilledCell[];
  updatedAt: string;
}

export interface UpsertProgressDto {
  highlightedCells: FilledCell[];
}

// ---------------------------------------------------------------------------
// Serialization helpers
// ---------------------------------------------------------------------------

/** Convert a sparse filled-cell Set to the API wire format. */
export function filledSetToArray(cells: Set<string>): FilledCell[] {
  return Array.from(cells).map((key) => {
    const [r, c] = key.split(',').map(Number);
    return [r, c] as FilledCell;
  });
}

/** Convert the API wire format back to an in-memory sparse Set. */
export function arrayToFilledSet(cells: FilledCell[]): Set<string> {
  return new Set(cells.map(([r, c]) => `${r},${c}`));
}

