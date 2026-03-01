
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

export interface DbPattern {
  name: string;
  rows: number;
  cols: number;
  cells: FilledCell[];
  updatedAt: Date;
  createdAt: Date;
}

export interface CreatePatternDto {
  name: string;
  rows: number;
  cols: number;
}

export interface UpdatePatternDto {
  name?: string | undefined;
  cells?: FilledCell[] | undefined;
}

export interface DbProgress {
  highlightedCells: FilledCell[];
  updatedAt: Date;
}

export interface ProgressDto {
  _id: string;
  highlightedCells: FilledCell[];
  updatedAt: string;
}

export interface UpsertProgressDto {
  highlightedCells: FilledCell[];
}
