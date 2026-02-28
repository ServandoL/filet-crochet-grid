import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-grid-col-headers',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Left spacer aligns with row-header strip -->
    <div class="flex shrink-0" [style.height.px]="HEADER_HEIGHT">
      <div [style.width.px]="ROW_HEADER_WIDTH" class="shrink-0"></div>

      @for (col of colIndices(); track col) {
        <button
          type="button"
          class="flex items-center justify-center text-xs font-mono text-gray-500 border-r
                 border-gray-200 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-700 shrink-0
                 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500
                 disabled:cursor-default disabled:hover:bg-gray-50 disabled:hover:text-gray-500
                 transition-colors select-none"
          [style.width.px]="cellSize()"
          [disabled]="readonly()"
          [attr.aria-disabled]="readonly() || null"
          [attr.aria-label]="'Column ' + (col + 1) + ': click to fill or clear'"
          (click)="onColClick(col)"
        >
          {{ col + 1 }}
        </button>
      }
    </div>
  `,
  host: { class: 'block shrink-0' },
})
export class GridColHeadersComponent {
  readonly cols = input.required<number>();
  readonly cellSize = input.required<number>();
  readonly readonly = input<boolean>(false);

  readonly colClicked = output<number>();

  readonly HEADER_HEIGHT = 40;
  readonly ROW_HEADER_WIDTH = 40;

  readonly colIndices = computed(() => Array.from({ length: this.cols() }, (_, i) => i));

  onColClick(col: number): void {
    if (!this.readonly()) this.colClicked.emit(col);
  }
}

