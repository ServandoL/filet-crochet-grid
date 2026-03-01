import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GridCanvasComponent } from './grid-canvas.component';

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

    // Set required inputs
    fixture.componentRef.setInput('rows', 10);
    fixture.componentRef.setInput('cols', 10);
    fixture.componentRef.setInput('filledCells', new Set<string>());

    fixture.detectChanges();

    // GridCanvasComponent uses afterNextRender to setup listeners.
    // In unit tests, we may need to trigger this manually or mock it.
    // Since it's private and uses afterNextRender, we call the setup method directly.
    (component as any).setupTouchListeners();
  });

  function createTouchEvent(type: string, touches: Partial<Touch>[]): TouchEvent {
    const event = new TouchEvent(type, {
      bubbles: true,
      cancelable: true
    });
    Object.defineProperty(event, 'touches', { value: touches });
    Object.defineProperty(event, 'changedTouches', { value: touches });
    return event;
  }

  it('should call e.preventDefault() on touchend when displacement is less than 8px (tap)', () => {
    const touchStart = createTouchEvent('touchstart', [{ clientX: 10, clientY: 10 }] as any);
    el.dispatchEvent(touchStart);

    const touchEnd = createTouchEvent('touchend', [] as any);
    Object.defineProperty(touchEnd, 'changedTouches', {
      value: [{ clientX: 12, clientY: 12 }] // displacement = sqrt(4+4) = 2.82 < 8
    });
    Object.defineProperty(touchEnd, 'touches', { value: [] });

    const preventDefaultSpy = vi.spyOn(touchEnd, 'preventDefault');
    el.dispatchEvent(touchEnd);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('should NOT call e.preventDefault() on touchend when displacement is 8px or more (drag)', () => {
    const touchStart = createTouchEvent('touchstart', [{ clientX: 10, clientY: 10 }] as any);
    el.dispatchEvent(touchStart);

    const touchEnd = createTouchEvent('touchend', [] as any);
    Object.defineProperty(touchEnd, 'changedTouches', {
      value: [{ clientX: 20, clientY: 20 }] // displacement = sqrt(100+100) = 14.14 >= 8
    });
    Object.defineProperty(touchEnd, 'touches', { value: [] });

    const preventDefaultSpy = vi.spyOn(touchEnd, 'preventDefault');
    el.dispatchEvent(touchEnd);

    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });

  it('should emit cellToggled exactly once per simulated tap (suppressing ghost click)', () => {
    const emitSpy = vi.spyOn(component.cellToggled, 'emit');

    // Mock getBoundingClientRect for hit-testing
    const canvas = el.querySelector('canvas')!;
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 240,
      height: 240
    } as DOMRect);

    // 1. Simulate Touch Start
    const touchStart = createTouchEvent('touchstart', [{ clientX: 10, clientY: 10 }] as any);
    el.dispatchEvent(touchStart);

    // 2. Simulate Touch End (Tap)
    const touchEnd = createTouchEvent('touchend', [] as any);
    Object.defineProperty(touchEnd, 'changedTouches', {
      value: [{ clientX: 10, clientY: 10 }]
    });
    Object.defineProperty(touchEnd, 'touches', { value: [] });

    el.dispatchEvent(touchEnd);

    // 3. Simulate subsequent click event if not prevented
    // This models the browser's behavior: it only fires click if touchend was NOT prevented.
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

    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      clientX: 30, // With 24px cells, this is col 1
      clientY: 10  // row 0
    });

    // MouseEvent offsetX/offsetY are often 0 in JSDOM unless mocked
    Object.defineProperty(clickEvent, 'offsetX', { value: 30 });
    Object.defineProperty(clickEvent, 'offsetY', { value: 10 });

    canvas.dispatchEvent(clickEvent);

    expect(emitSpy).toHaveBeenCalledWith({ row: 0, col: 1 });
  });
});
