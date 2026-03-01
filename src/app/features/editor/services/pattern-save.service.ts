import {DestroyRef, inject, Injectable} from '@angular/core';
import {PatternApiService} from '../../../core/services/pattern-api.service';
import {GridState} from '../models/grid-state.model';
import {filledSetToArray} from '../../../core/models/pattern.model';
import {createSavePipeline, SavePipeline} from './create-save-pipeline';

export type {SaveStatus} from './create-save-pipeline';

@Injectable({providedIn: 'root'})
export class PatternSaveService {
  private readonly api = inject(PatternApiService);
  private readonly pipeline: SavePipeline<GridState> = createSavePipeline(
    (state) =>
      this.api.updatePattern(state._id, {
        name: state.name,
        cells: filledSetToArray(state.filledCells),
      }),
    inject(DestroyRef),
  );

  readonly isDirty = this.pipeline.isDirty;
  readonly saveStatus = this.pipeline.saveStatus;

  scheduleAutoSave(state: GridState): void {
    this.pipeline.scheduleAutoSave(state);
  }

  saveNow(state: GridState): void {
    this.pipeline.saveNow(state);
  }
}
