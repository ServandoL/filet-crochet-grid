import { describe, expect, it, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { GridEditorComponent } from './grid-editor.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('GridEditorComponent — sectionChipLabel', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GridEditorComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
  });

  function makeComponent() {
    const fixture = TestBed.createComponent(GridEditorComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('id', 'test-id');
    return component;
  }

  function setGridState(component: GridEditorComponent, sectionRowInterval: number, sectionColInterval: number): void {
    component.gridState.set({
      _id: 'test-id',
      name: 'Test',
      rows: 20,
      cols: 20,
      filledCells: new Set(),
      sectionRowInterval,
      sectionColInterval,
    });
  }

  describe('6.3 chip label computation', () => {
    it('returns "Off" when both intervals are zero', () => {
      const c = makeComponent();
      setGridState(c, 0, 0);
      expect(c.sectionChipLabel()).toBe('Off');
    });

    it('returns "Off" when gridState is null', () => {
      const c = makeComponent();
      c.gridState.set(null);
      expect(c.sectionChipLabel()).toBe('Off');
    });

    it('returns "10 × 15" when both intervals are set', () => {
      const c = makeComponent();
      setGridState(c, 10, 15);
      expect(c.sectionChipLabel()).toBe('10 × 15');
    });

    it('returns "10 × 0" for mixed — row active, col zero', () => {
      const c = makeComponent();
      setGridState(c, 10, 0);
      expect(c.sectionChipLabel()).toBe('10 × 0');
    });

    it('returns "0 × 10" for mixed — col active, row zero', () => {
      const c = makeComponent();
      setGridState(c, 0, 10);
      expect(c.sectionChipLabel()).toBe('0 × 10');
    });

    it('returns "10 × 10" for equal intervals', () => {
      const c = makeComponent();
      setGridState(c, 10, 10);
      expect(c.sectionChipLabel()).toBe('10 × 10');
    });
  });
});
