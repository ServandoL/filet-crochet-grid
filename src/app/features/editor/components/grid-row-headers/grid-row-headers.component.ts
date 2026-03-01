import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-grid-row-headers',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './grid-row-headers.component.html',
  host: { class: 'block shrink-0' },
})
export class GridRowHeadersComponent {
  readonly rows = input.required<number>();
  readonly cellSize = input.required<number>();
  readonly readonly = input<boolean>(false);
  readonly progressMode = input<boolean>(false);

  readonly rowClicked = output<number>();

  readonly HEADER_WIDTH = 40;

  readonly rowIndices = computed(() => Array.from({ length: this.rows() }, (_, i) => i));
  readonly buttonSize = computed(() => this.cellSize());

  onRowClick(row: number): void {
    if (!this.readonly()) this.rowClicked.emit(row);
  }
}

