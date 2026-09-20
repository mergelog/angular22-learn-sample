import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { ColorSyncService } from './core/services/color-sync.service';
import { appEffects } from './core/store/app.effects';
import { colorFeature } from './features/color/store/color.reducer';
import { toggleFeature } from './features/toggle/store/toggle.reducer';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideStore({
      [toggleFeature.name]: toggleFeature.reducer,
      [colorFeature.name]: colorFeature.reducer,
    }),
    provideEffects(appEffects),
    ColorSyncService,
  ],
};
