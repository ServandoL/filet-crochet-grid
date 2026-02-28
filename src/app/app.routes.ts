import { Routes } from '@angular/router';
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
    loadComponent: () =>
      import('./features/editor/grid-editor/grid-editor.component').then(
        (m) => m.GridEditorComponent,
      ),
  },
  { path: '', redirectTo: 'patterns', pathMatch: 'full' },
  { path: '**', redirectTo: 'patterns' },
];
