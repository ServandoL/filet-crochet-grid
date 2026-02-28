import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { PatternSaveService } from '../services/pattern-save.service';

// The guard works for any component — no component-specific interface needed.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const unsavedChangesGuard: CanDeactivateFn<unknown> = () => {
  const saveService = inject(PatternSaveService);

  if (saveService.isDirty()) {
    return window.confirm('You have unsaved changes. Leave without saving?');
  }

  return true;
};

