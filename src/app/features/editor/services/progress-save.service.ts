import {DestroyRef, inject, Injectable} from '@angular/core';
import {PatternApiService} from '../../../core/services/pattern-api.service';
import {filledSetToArray} from '../../../core/models/pattern.model';
import {ProgressState} from '../models/progress-state.model';
import {createSavePipeline, SavePipeline} from './create-save-pipeline';

export type {SaveStatus} from './create-save-pipeline';

@Injectable({providedIn: 'root'})
export class ProgressSaveService {
  private readonly api = inject(PatternApiService);
  private readonly pipeline: SavePipeline<ProgressState> = createSavePipeline(
    (state) =>
      this.api.upsertProgress(state.patternId, {
        highlightedCells: filledSetToArray(state.highlightedCells),
      }),
    inject(DestroyRef),
  );

  readonly isDirty = this.pipeline.isDirty;
  readonly saveStatus = this.pipeline.saveStatus;

  scheduleAutoSave(state: ProgressState): void {
    this.pipeline.scheduleAutoSave(state);
  }

  saveNow(state: ProgressState): void {
    this.pipeline.saveNow(state);
  }
}
