import { provideHttpClient, withFetch, withInterceptors } from "@angular/common/http";
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from "@angular/core";
import { provideRouter, withComponentInputBinding } from "@angular/router";
import { provideStore } from "@ngrx/store";
import { provideStoreDevtools } from "@ngrx/store-devtools";
import { apiBaseUrlInterceptor } from "@core/http/api-base-url.interceptor";
import { environment } from "@env/environment";
import { appRoutes } from "./app.routes";

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes, withComponentInputBinding()),
    provideHttpClient(withFetch(), withInterceptors([apiBaseUrlInterceptor])),
    /**
     * root には空の store だけを置き、feature の state は各 routes で provideState する。
     * runtimeChecks は開発中に「reducer の外で state を書き換えた」を即座に落とすため、
     * 大規模ほど最初から全部有効にしておく。後から有効化すると違反箇所が数百件出る。
     */
    provideStore(
      {},
      {
        runtimeChecks: {
          strictStateImmutability: true,
          strictActionImmutability: true,
          strictStateSerializability: true,
          strictActionSerializability: true,
          strictActionTypeUniqueness: true,
        },
      },
    ),
    ...(environment.production ? [] : [provideStoreDevtools({ maxAge: 50 })]),
  ],
};
