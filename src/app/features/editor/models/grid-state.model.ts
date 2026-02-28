export interface GridState {
  patternId: string;
  name: string;
  rows: number;
  cols: number;
  filledCells: Set<string>;
}

