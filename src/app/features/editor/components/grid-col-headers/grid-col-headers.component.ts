import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-grid-col-headers',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './grid-col-headers.component.html',
  host: { class: 'block shrink-0' },
})
export class GridColHeadersComponent {
  readonly cols = input.required<number>();
  readonly cellSize = input.required<number>();
  readonly readonly = input<boolean>(false);
  readonly progressMode = input<boolean>(false);

  readonly colClicked = output<number>();

  readonly HEADER_HEIGHT = 40;
  readonly ROW_HEADER_WIDTH = 40;

  readonly colIndices = computed(() => Array.from({ length: this.cols() }, (_, i) => i));
  readonly buttonSize = computed(() => this.cellSize());

  onColClick(col: number): void {
    if (!this.readonly()) this.colClicked.emit(col);
  }
}

