export interface GridState {
  _id: string;
  name: string;
  rows: number;
  cols: number;
  filledCells: Set<string>;
}

