import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ShellComponent } from '@home/ui';
import { HouseholdGateComponent } from '@home/ui/household';

@Component({
  selector: 'app-root',
  imports: [ShellComponent, HouseholdGateComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * The gate creates the shell, and with it the routed app, only once a household is chosen, so
 * every page's first load already carries X-Household-Id. It also shows the picker and the
 * "signed out" banner.
 */
export class App {}
