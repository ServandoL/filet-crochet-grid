import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { householdInterceptor, provideHousehold, sessionInterceptor } from '@home/ui/household';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withFetch(),
      withInterceptors([sessionInterceptor, householdInterceptor, authInterceptor]),
    ),
    // Every call to the crochet API carries the chosen household; the gate in App asks for one.
    provideHousehold({ appId: 'crochet' }),
  ],
};
