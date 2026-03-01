import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  afterNextRender,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

export interface CellPosition {
  row: number;
  col: number;
}

const DEFAULT_CELL_SIZE = 24;

@Component({
  selector: 'app-grid-canvas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './grid-canvas.component.html',
  host: {
    class: 'block',
  },
})
export class GridCanvasComponent implements OnDestroy {
  // ── Inputs ───────────────────────────────────────────────────────────────
  readonly rows = input.required<number>();
  readonly cols = input.required<number>();
  readonly filledCells = input.required<Set<string>>();
  readonly cellSize = input<number>(DEFAULT_CELL_SIZE);
  readonly zoomLevel = input<number>(1);
  readonly readonly = input<boolean>(false);
  readonly highlightedCells = input<Set<string>>(new Set());

  // ── Outputs ──────────────────────────────────────────────────────────────
  readonly cellToggled = output<CellPosition>();

  // ── Touch state ──────────────────────────────────────────────────────────
  readonly touchStartX = signal(0);
  readonly touchStartY = signal(0);
  readonly initialPinchDistance = signal(0);
  readonly initialZoom = signal(1);

  // ── Canvas ref ───────────────────────────────────────────────────────────
  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly el = inject(ElementRef);

  constructor() {
    // Draw whenever any relevant input changes
    effect(() => {
      // Access all reactive inputs to register dependencies
      const rows = this.rows();
      const cols = this.cols();
      const filledCells = this.filledCells();
      const cellSize = this.cellSize();
      const highlightedCells = this.highlightedCells();

      void rows; void cols; void filledCells; void cellSize; void highlightedCells;
      this.drawGrid();
    });

    afterNextRender(() => {
      this.setupTouchListeners();
    });
  }

  ngOnDestroy(): void {
    this.removeTouchListeners();
  }

  // ── Drawing ──────────────────────────────────────────────────────────────
  private drawGrid(): void {
    const canvasEl = this.canvasRef()?.nativeElement;
    if (!canvasEl) return;

    const rows = this.rows();
    const cols = this.cols();
    const cellSize = this.cellSize();
    const filled = this.filledCells();

    const width = cols * cellSize;
    const height = rows * cellSize;

    canvasEl.width = width;
    canvasEl.height = height;

    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Filled cells
    ctx.fillStyle = '#000000';
    for (const key of filled) {
      const [r, c] = key.split(',').map(Number);
      ctx.fillRect(c * cellSize + 1, r * cellSize + 1, cellSize - 1, cellSize - 1);
    }

    // Grid lines
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    for (let c = 0; c <= cols; c++) {
      ctx.moveTo(c * cellSize, 0);
      ctx.lineTo(c * cellSize, height);
    }
    for (let r = 0; r <= rows; r++) {
      ctx.moveTo(0, r * cellSize);
      ctx.lineTo(width, r * cellSize);
    }
    ctx.stroke();

    // Progress highlight overlay — 2 px inset teal border per highlighted cell
    const highlighted = this.highlightedCells();
    if (highlighted.size > 0) {
      ctx.strokeStyle = '#0f766e'; // teal-700 — meets WCAG AA 3:1 on both white and black
      ctx.lineWidth = 2;
      for (const key of highlighted) {
        const [r, c] = key.split(',').map(Number);
        ctx.strokeRect(c * cellSize + 2, r * cellSize + 2, cellSize - 4, cellSize - 4);
      }
    }
  }

  // ── Click hit-test ───────────────────────────────────────────────────────
  onCanvasClick(event: MouseEvent): void {
    if (this.readonly()) return;
    const cellSize = this.cellSize();
    const col = Math.floor(event.offsetX / cellSize);
    const row = Math.floor(event.offsetY / cellSize);
    if (row >= 0 && row < this.rows() && col >= 0 && col < this.cols()) {
      this.cellToggled.emit({ row, col });
    }
  }

  // ── Touch listeners (non-passive for preventDefault) ─────────────────────
  private boundTouchStart!: (e: TouchEvent) => void;
  private boundTouchMove!: (e: TouchEvent) => void;
  private boundTouchEnd!: (e: TouchEvent) => void;

  private setupTouchListeners(): void {
    const el = this.el.nativeElement as HTMLElement;
    this.boundTouchStart = (e) => this.onTouchStart(e);
    this.boundTouchMove = (e) => this.onTouchMove(e);
    this.boundTouchEnd = (e) => this.onTouchEnd(e);
    el.addEventListener('touchstart', this.boundTouchStart, { passive: false });
    el.addEventListener('touchmove', this.boundTouchMove, { passive: false });
    el.addEventListener('touchend', this.boundTouchEnd, { passive: false });
  }

  private removeTouchListeners(): void {
    const el = this.el.nativeElement as HTMLElement;
    if (this.boundTouchStart) el.removeEventListener('touchstart', this.boundTouchStart);
    if (this.boundTouchMove) el.removeEventListener('touchmove', this.boundTouchMove);
    if (this.boundTouchEnd) el.removeEventListener('touchend', this.boundTouchEnd);
  }

  private onTouchStart(e: TouchEvent): void {
    if (e.touches.length === 1) {
      this.touchStartX.set(e.touches[0].clientX);
      this.touchStartY.set(e.touches[0].clientY);
    } else if (e.touches.length === 2) {
      e.preventDefault();
      this.initialPinchDistance.set(this.getPinchDistance(e));
      this.initialZoom.set(this.zoomLevel());
    }
  }

  private onTouchMove(e: TouchEvent): void {
    if (e.touches.length === 2) {
      e.preventDefault();
      const currentDist = this.getPinchDistance(e);
      const initDist = this.initialPinchDistance();
      if (initDist === 0) return;
      const newZoom = Math.min(4, Math.max(0.5, this.initialZoom() * (currentDist / initDist)));
      // Emit zoom change via a custom event the parent can listen to
      this.el.nativeElement.dispatchEvent(
        new CustomEvent('zoomchange', { detail: newZoom, bubbles: true }),
      );
    }
  }

  private onTouchEnd(e: TouchEvent): void {
    if (this.readonly()) return;
    if (e.changedTouches.length === 1 && e.touches.length === 0) {
      const dx = e.changedTouches[0].clientX - this.touchStartX();
      const dy = e.changedTouches[0].clientY - this.touchStartY();
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 8) {
        // It's a tap — hit-test against canvas
        const canvas = this.canvasRef().nativeElement;
        const rect = canvas.getBoundingClientRect();
        const zoom = this.zoomLevel();
        const cellSize = this.cellSize();
        const x = (e.changedTouches[0].clientX - rect.left) / zoom;
        const y = (e.changedTouches[0].clientY - rect.top) / zoom;
        const col = Math.floor(x / cellSize);
        const row = Math.floor(y / cellSize);
        if (row >= 0 && row < this.rows() && col >= 0 && col < this.cols()) {
          this.cellToggled.emit({ row, col });
        }
      }
    }
  }

  private getPinchDistance(e: TouchEvent): number {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

