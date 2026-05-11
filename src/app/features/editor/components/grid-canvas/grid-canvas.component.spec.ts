import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GridCanvasComponent } from './grid-canvas.component';

const CELL_SIZE = 24;

describe('GridCanvasComponent', () => {
  let component: GridCanvasComponent;
  let fixture: ComponentFixture<GridCanvasComponent>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GridCanvasComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(GridCanvasComponent);
    component = fixture.componentInstance;
    el = fixture.nativeElement;

    fixture.componentRef.setInput('rows', 10);
    fixture.componentRef.setInput('cols', 10);
    fixture.componentRef.setInput('filledCells', new Set<string>());

    fixture.detectChanges();
  });

  function createTouchEvent(type: string, options: { touches?: Partial<Touch>[], changedTouches?: Partial<Touch>[] }): TouchEvent {
    const event = new TouchEvent(type, { bubbles: true, cancelable: true });
    const touches = options.touches || [];
    const changedTouches = options.changedTouches || touches;
    Object.defineProperty(event, 'touches', { value: touches, configurable: true });
    Object.defineProperty(event, 'changedTouches', { value: changedTouches, configurable: true });
    return event;
  }

  // ── Section grid lines draw pass ──────────────────────────────────────────

  describe('section grid lines draw pass', () => {
    // Only captures moveTo/lineTo/stroke calls that happen between ctx.save() and ctx.restore()
    // (section lines are the only draw pass that uses save/restore)
    let sectionMoveToArgs: number[][];
    let sectionLineToArgs: number[][];
    let sectionStrokeCalled: boolean;

    beforeEach(() => {
      sectionMoveToArgs = [];
      sectionLineToArgs = [];
      sectionStrokeCalled = false;

      let inSection = false;
      const canvas = el.querySelector('canvas')!;
      vi.spyOn(canvas, 'getContext').mockReturnValue({
        fillRect: vi.fn(),
        strokeRect: vi.fn(),
        beginPath: vi.fn(),
        save: () => { inSection = true; },
        restore: () => { inSection = false; },
        moveTo: (...args: number[]) => { if (inSection) sectionMoveToArgs.push(args); },
        lineTo: (...args: number[]) => { if (inSection) sectionLineToArgs.push(args); },
        stroke: () => { if (inSection) sectionStrokeCalled = true; },
        get fillStyle() { return ''; },
        set fillStyle(_: unknown) {},
        get strokeStyle() { return ''; },
        set strokeStyle(_: unknown) {},
        get lineWidth() { return 1; },
        set lineWidth(_: number) {},
      } as unknown as CanvasRenderingContext2D);
    });

    function forceRedraw(): void {
      sectionMoveToArgs = [];
      sectionLineToArgs = [];
      sectionStrokeCalled = false;
      fixture.componentRef.setInput('filledCells', new Set<string>());
      fixture.detectChanges();
    }

    it('6.1 draws one horizontal line at row interval boundary when row interval is set', () => {
      fixture.componentRef.setInput('sectionRowInterval', 5);
      fixture.componentRef.setInput('sectionColInterval', 5);
      forceRedraw();
      // Horizontal line: moveTo(0, 5*24) → lineTo(10*24, 5*24)
      const hLines = sectionMoveToArgs.filter(([x]) => x === 0);
      expect(hLines.length).toBe(1);
      expect(hLines[0]).toEqual([0, 5 * CELL_SIZE]);
      expect(sectionLineToArgs).toContainEqual([10 * CELL_SIZE, 5 * CELL_SIZE]);
    });

    it('6.1 draws one vertical line at col interval boundary when col interval is set', () => {
      fixture.componentRef.setInput('sectionRowInterval', 5);
      fixture.componentRef.setInput('sectionColInterval', 5);
      forceRedraw();
      // Vertical line: moveTo(5*24, 0) → lineTo(5*24, 10*24)
      const vLines = sectionMoveToArgs.filter(([_x, y]) => y === 0);
      expect(vLines.length).toBe(1);
      expect(vLines[0]).toEqual([5 * CELL_SIZE, 0]);
      expect(sectionLineToArgs).toContainEqual([5 * CELL_SIZE, 10 * CELL_SIZE]);
    });

    it('6.1 draws only horizontal lines when only row interval is set', () => {
      fixture.componentRef.setInput('sectionRowInterval', 5);
      fixture.componentRef.setInput('sectionColInterval', 0);
      forceRedraw();
      const hLines = sectionMoveToArgs.filter(([x]) => x === 0);
      const vLines = sectionMoveToArgs.filter(([_x, y]) => y === 0);
      expect(hLines.length).toBe(1);
      expect(vLines.length).toBe(0);
      expect(sectionStrokeCalled).toBe(true);
    });

    it('6.1 draws only vertical lines when only col interval is set', () => {
      fixture.componentRef.setInput('sectionRowInterval', 0);
      fixture.componentRef.setInput('sectionColInterval', 5);
      forceRedraw();
      const hLines = sectionMoveToArgs.filter(([x]) => x === 0);
      const vLines = sectionMoveToArgs.filter(([_x, y]) => y === 0);
      expect(hLines.length).toBe(0);
      expect(vLines.length).toBe(1);
      expect(sectionStrokeCalled).toBe(true);
    });

    it('6.2 draws no section lines when both intervals are zero', () => {
      forceRedraw(); // both already 0 by default
      expect(sectionMoveToArgs.length).toBe(0);
      expect(sectionStrokeCalled).toBe(false);
    });
  });

  // ── Touch events ────────────────────────────────────────────────────────────

  it('should call e.preventDefault() on touchend when displacement is less than 8px (tap)', () => {
    const touchStart = createTouchEvent('touchstart', { touches: [{ clientX: 10, clientY: 10 }] as any });
    el.dispatchEvent(touchStart);
    const touchEnd = createTouchEvent('touchend', {
      touches: [],
      changedTouches: [{ clientX: 12, clientY: 12 }] as any
    });
    const preventDefaultSpy = vi.spyOn(touchEnd, 'preventDefault');
    el.dispatchEvent(touchEnd);
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('should NOT call e.preventDefault() on touchend when displacement is 8px or more (drag)', () => {
    const touchStart = createTouchEvent('touchstart', { touches: [{ clientX: 10, clientY: 10 }] as any });
    el.dispatchEvent(touchStart);
    const touchEnd = createTouchEvent('touchend', {
      touches: [],
      changedTouches: [{ clientX: 20, clientY: 20 }] as any
    });
    const preventDefaultSpy = vi.spyOn(touchEnd, 'preventDefault');
    el.dispatchEvent(touchEnd);
    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });

  it('should emit cellToggled exactly once per simulated tap (suppressing ghost click)', () => {
    const emitSpy = vi.spyOn(component.cellToggled, 'emit');
    const canvas = el.querySelector('canvas')!;
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
      left: 0, top: 0, width: 240, height: 240
    } as DOMRect);
    const touchStart = createTouchEvent('touchstart', { touches: [{ clientX: 10, clientY: 10 }] as any });
    el.dispatchEvent(touchStart);
    const touchEnd = createTouchEvent('touchend', {
      touches: [],
      changedTouches: [{ clientX: 10, clientY: 10 }] as any
    });
    el.dispatchEvent(touchEnd);
    expect(touchEnd.defaultPrevented).toBe(true);
    if (!touchEnd.defaultPrevented) {
      const clickEvent = new MouseEvent('click', { bubbles: true });
      canvas.dispatchEvent(clickEvent);
    }
    expect(emitSpy).toHaveBeenCalledTimes(1);
    expect(emitSpy).toHaveBeenCalledWith({ row: 0, col: 0 });
  });

  it('should emit cellToggled on regular mouse clicks (desktop)', () => {
    const emitSpy = vi.spyOn(component.cellToggled, 'emit');
    const canvas = el.querySelector('canvas')!;
    const clickEvent = new MouseEvent('click', { bubbles: true, clientX: 30, clientY: 10 });
    Object.defineProperty(clickEvent, 'offsetX', { value: 30 });
    Object.defineProperty(clickEvent, 'offsetY', { value: 10 });
    canvas.dispatchEvent(clickEvent);
    expect(emitSpy).toHaveBeenCalledWith({ row: 0, col: 1 });
  });
});

