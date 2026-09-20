import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideStore } from '@ngrx/store';
import {
  processingFeatureKey,
  processingReducer,
} from './features/processing/store/processing.reducer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideStore({
      [processingFeatureKey]: processingReducer
    }),
  ],
};
