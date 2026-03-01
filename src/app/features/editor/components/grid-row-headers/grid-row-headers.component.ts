import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-grid-row-headers',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col" [style.width.px]="HEADER_WIDTH">

      @for (row of rowIndices(); track row) {
        <button
          type="button"
          class="flex items-center justify-center text-xs font-mono text-gray-500 border-b
                 border-gray-200 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-700 shrink-0
                 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500
                 disabled:cursor-default disabled:hover:bg-gray-50 disabled:hover:text-gray-500
                 transition-colors select-none"
          [style.height.px]="cellSize()"
          [disabled]="readonly()"
          [attr.aria-disabled]="readonly() || null"
          [attr.aria-label]="'Row ' + (row + 1) + ': click to fill or clear'"
          (click)="onRowClick(row)"
        >
          {{ row + 1 }}
        </button>
      }
    </div>
  `,
  host: { class: 'block shrink-0' },
})
export class GridRowHeadersComponent {
  readonly rows = input.required<number>();
  readonly cellSize = input.required<number>();
  readonly readonly = input<boolean>(false);

  readonly rowClicked = output<number>();

  readonly HEADER_WIDTH = 40;

  readonly rowIndices = computed(() => Array.from({ length: this.rows() }, (_, i) => i));

  onRowClick(row: number): void {
    if (!this.readonly()) this.rowClicked.emit(row);
  }
}

