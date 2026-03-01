/**
 * Represents the in-editor state of a pattern.
 *
 * Note: the `_id` field mirrors the MongoDB document id returned by the API
 * (i.e. `pattern._id`). The original task spec named it `patternId`, but using
 * `_id` keeps the shape consistent with the `Pattern` model and avoids an
 * unnecessary mapping step on load/save.
 */
export interface GridState {
  /** MongoDB document id — corresponds to `Pattern._id`. */
  _id: string;
  name: string;
  rows: number;
  cols: number;
  filledCells: Set<string>;
}

