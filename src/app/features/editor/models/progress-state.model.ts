/**
 * In-editor state for progress tracking mode.
 *
 * `patternId` is the local name for the value sourced from the route `:id`
 * param and from `Progress._id` (satellite document pattern — the progress
 * document's `_id` equals the parent pattern's `_id`).
 */
export interface ProgressState {
  patternId: string;
  highlightedCells: Set<string>;
  /** ISO string from pattern.updatedAt — used for stale-progress comparison. */
  patternUpdatedAt: string;
  /** ISO string from progress.updatedAt, or null if no prior progress exists. */
  progressUpdatedAt: string | null;
}

