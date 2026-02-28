import { describe, expect, it } from 'vitest';
import {
  cellKey,
  clearCol,
  clearRow,
  fillCol,
  fillRow,
  isColFull,
  isRowFull,
  toggleCell,
} from './grid.utils';

// ---------------------------------------------------------------------------
// cellKey
// ---------------------------------------------------------------------------
describe('cellKey', () => {
  it('formats as "row,col"', () => {
    expect(cellKey(0, 0)).toBe('0,0');
    expect(cellKey(12, 5)).toBe('12,5');
  });
});

// ---------------------------------------------------------------------------
// toggleCell
// ---------------------------------------------------------------------------
describe('toggleCell', () => {
  it('adds an empty cell', () => {
    const result = toggleCell(new Set(), 1, 2);
    expect(result.has('1,2')).toBe(true);
  });

  it('removes a filled cell', () => {
    const cells = new Set(['1,2']);
    const result = toggleCell(cells, 1, 2);
    expect(result.has('1,2')).toBe(false);
  });

  it('returns a new Set (immutable)', () => {
    const original = new Set<string>();
    const result = toggleCell(original, 0, 0);
    expect(result).not.toBe(original);
  });
});

// ---------------------------------------------------------------------------
// isRowFull
// ---------------------------------------------------------------------------
describe('isRowFull', () => {
  it('returns true when all cells in row are filled', () => {
    const cells = new Set(['0,0', '0,1', '0,2']);
    expect(isRowFull(cells, 0, 3)).toBe(true);
  });

  it('returns false when row is empty', () => {
    expect(isRowFull(new Set(), 0, 3)).toBe(false);
  });

  it('returns false when row is partial', () => {
    const cells = new Set(['0,0', '0,2']);
    expect(isRowFull(cells, 0, 3)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// fillRow — Camp A fill-first
// ---------------------------------------------------------------------------
describe('fillRow', () => {
  it('fills an empty row', () => {
    const result = fillRow(new Set(), 0, 3);
    expect(result).toEqual(new Set(['0,0', '0,1', '0,2']));
  });

  it('fills remaining cells of a partial row', () => {
    const cells = new Set(['0,0']);
    const result = fillRow(cells, 0, 3);
    expect(result).toEqual(new Set(['0,0', '0,1', '0,2']));
  });

  it('clears a fully-filled row (toggle off)', () => {
    const cells = new Set(['0,0', '0,1', '0,2']);
    const result = fillRow(cells, 0, 3);
    expect(result.has('0,0')).toBe(false);
    expect(result.has('0,1')).toBe(false);
    expect(result.has('0,2')).toBe(false);
  });

  it('does not affect other rows', () => {
    const cells = new Set(['1,0', '1,1', '1,2']);
    const result = fillRow(cells, 0, 3);
    expect(result.has('1,0')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// clearRow
// ---------------------------------------------------------------------------
describe('clearRow', () => {
  it('clears all cells in a row', () => {
    const cells = new Set(['0,0', '0,1', '0,2', '1,0']);
    const result = clearRow(cells, 0, 3);
    expect(result.has('0,0')).toBe(false);
    expect(result.has('1,0')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// isColFull
// ---------------------------------------------------------------------------
describe('isColFull', () => {
  it('returns true when all cells in col are filled', () => {
    const cells = new Set(['0,1', '1,1', '2,1']);
    expect(isColFull(cells, 1, 3)).toBe(true);
  });

  it('returns false for partial column', () => {
    const cells = new Set(['0,1']);
    expect(isColFull(cells, 1, 3)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// fillCol — Camp A fill-first
// ---------------------------------------------------------------------------
describe('fillCol', () => {
  it('fills an empty column', () => {
    const result = fillCol(new Set(), 1, 3);
    expect(result).toEqual(new Set(['0,1', '1,1', '2,1']));
  });

  it('fills remaining cells of a partial column', () => {
    const cells = new Set(['0,1']);
    const result = fillCol(cells, 1, 3);
    expect(result).toEqual(new Set(['0,1', '1,1', '2,1']));
  });

  it('clears a fully-filled column', () => {
    const cells = new Set(['0,1', '1,1', '2,1']);
    const result = fillCol(cells, 1, 3);
    expect(result.has('0,1')).toBe(false);
    expect(result.has('1,1')).toBe(false);
    expect(result.has('2,1')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// clearCol
// ---------------------------------------------------------------------------
describe('clearCol', () => {
  it('clears all cells in a column', () => {
    const cells = new Set(['0,1', '1,1', '0,0']);
    const result = clearCol(cells, 1, 2);
    expect(result.has('0,1')).toBe(false);
    expect(result.has('1,1')).toBe(false);
    expect(result.has('0,0')).toBe(true);
  });
});

