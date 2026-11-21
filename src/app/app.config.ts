import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideIcons } from '@ng-icons/core';
import {
  heroArrowLeftSolid,
  heroCheckSolid,
  heroExclamationTriangleSolid,
  heroPlusSolid,
  heroSquares2x2Solid,
  heroTableCellsSolid,
  heroXMarkSolid,
} from '@ng-icons/heroicons/solid';
import { provideHomeTheme, SETTINGS_NAV_ROUTE } from '@home/ui';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { householdInterceptor, provideHousehold, sessionInterceptor } from '@home/ui/household';
import { clientIdInterceptor, provideRealtime } from '@home/ui/realtime';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withFetch(),
      withInterceptors([sessionInterceptor, householdInterceptor, authInterceptor, clientIdInterceptor]),
    ),
    // Every call to the crochet API carries the chosen household; the gate in App asks for one.
    provideHousehold({ appId: 'crochet' }),
    // Other devices' changes arrive on the API's event stream; the list and editor refetch.
    provideRealtime({ apiUrl: environment.apiBaseUrl }),
    provideIcons({
      heroArrowLeftSolid,
      heroCheckSolid,
      heroExclamationTriangleSolid,
      heroPlusSolid,
      heroSquares2x2Solid,
      heroTableCellsSolid,
      heroXMarkSolid,
    }),
    // The editor route collapses the shell to give the grid the screen (see app.routes.ts).
    provideHomeTheme({
      appName: 'Filet Crochet',
      collapsibleShell: true,
      routes: [
        { name: 'Patterns', url: '/patterns', icon: { name: 'heroSquares2x2Solid' } },
        SETTINGS_NAV_ROUTE,
      ],
    }),
  ],
};
