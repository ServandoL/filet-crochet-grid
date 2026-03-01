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
  name?: string;
  cells?: FilledCell[];
}
