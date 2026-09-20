import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';

import { routes } from './app.routes';
import { fooBackendInterceptor } from './feature/p02-ngrx-http/mod-httpInterceptorFn/foo-backend.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([fooBackendInterceptor])),
    provideStore(),
    provideEffects(),
    provideRouter(routes, withComponentInputBinding()),
  ],
};
