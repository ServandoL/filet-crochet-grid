import { Routes } from '@angular/router';
import { SETTINGS_ROUTE, ShellRouteData } from '@home/ui';
import { authGuard } from './core/guards/auth.guard';
import { loginRedirectGuard } from './core/guards/login-redirect.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { unsavedChangesGuard } from './features/editor/guards/unsaved-changes.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [loginRedirectGuard],
  },
  {
    path: 'patterns',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/patterns/pattern-list/pattern-list.component').then(
        (m) => m.PatternListComponent,
      ),
  },
  {
    path: 'patterns/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/patterns/pattern-create/pattern-create.component').then(
        (m) => m.PatternCreateComponent,
      ),
  },
  {
    path: 'patterns/:id',
    canActivate: [authGuard],
    canDeactivate: [unsavedChangesGuard],
    // The grid scrolls itself under sticky row/column numbers; collapse the shell to give it room.
    data: { shellLayout: 'fill', shellCollapsed: true } satisfies ShellRouteData,
    loadComponent: () =>
      import('./features/editor/grid-editor/grid-editor.component').then(
        (m) => m.GridEditorComponent,
      ),
  },
  SETTINGS_ROUTE,
  { path: '', redirectTo: 'patterns', pathMatch: 'full' },
  { path: '**', redirectTo: 'patterns' },
];
