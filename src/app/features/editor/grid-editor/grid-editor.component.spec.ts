import { describe, expect, it, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { GridEditorComponent } from './grid-editor.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HouseholdEvents } from '@home/ui/realtime';
import { provideIcons } from '@ng-icons/core';
import { heroChevronDownSolid, heroChevronUpSolid } from '@ng-icons/heroicons/solid';
import { EMPTY } from 'rxjs';

describe('GridEditorComponent — sectionChipLabel', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GridEditorComponent],
      providers: [
        { provide: HouseholdEvents, useValue: { changes: EMPTY, resync: EMPTY, on: () => EMPTY } },
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

describe('GridEditorComponent — collapsible toolbar', () => {
  beforeEach(async () => {
    try {
      localStorage.clear();
    } catch {
      // Not available in every test environment.
    }
    await TestBed.configureTestingModule({
      imports: [GridEditorComponent],
      providers: [
        { provide: HouseholdEvents, useValue: { changes: EMPTY, resync: EMPTY, on: () => EMPTY } },
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideIcons({ heroChevronDownSolid, heroChevronUpSolid }),
      ],
    }).compileComponents();
  });

  async function render(mode = 'edit') {
    const fixture = TestBed.createComponent(GridEditorComponent);
    fixture.componentRef.setInput('id', 'test-id');
    fixture.componentRef.setInput('mode', mode);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const toggle = () => el.querySelector<HTMLButtonElement>('button[aria-controls="editor-tools"]')!;
    const tools = () => el.querySelector<HTMLElement>('#editor-tools')!;
    return { fixture, toggle, tools };
  }

  it('starts with the tools showing', async () => {
    const { toggle, tools } = await render();
    expect(tools().hidden).toBe(false);
    expect(toggle().getAttribute('aria-expanded')).toBe('true');
    expect(toggle().getAttribute('aria-label')).toBe('Hide editor tools');
  });

  it('hides the tools and keeps back and the toggle', async () => {
    const { fixture, toggle, tools } = await render();
    toggle().click();
    await fixture.whenStable();

    expect(tools().hidden).toBe(true);
    expect(toggle().getAttribute('aria-expanded')).toBe('false');
    expect(toggle().getAttribute('aria-label')).toBe('Show editor tools');
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('button[aria-label="Back to pattern list"]')).not.toBeNull();
  });

  it('closes the section popover when the tools collapse', async () => {
    const { fixture, toggle } = await render();
    const c = fixture.componentInstance;
    c.sectionPopoverOpen.set(true);
    toggle().click();
    await fixture.whenStable();

    expect(c.sectionPopoverOpen()).toBe(false);
  });

  it('shows no save status while viewing', async () => {
    const { fixture } = await render('view');
    expect(fixture.componentInstance.activeSave()).toBeNull();
  });
});
