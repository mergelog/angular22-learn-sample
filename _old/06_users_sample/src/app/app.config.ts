import { provideHttpClient, withFetch } from "@angular/common/http";
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from "@angular/core";
import { provideEffects } from "@ngrx/effects";
import { provideStore } from "@ngrx/store";
import { UsersApi } from "./features/users/data-access/users.api";
import { usersEffects } from "./features/users/store/users.effects";
import { usersFeature } from "./features/users/store/users.reducer";

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withFetch()),
    provideStore({ [usersFeature.name]: usersFeature.reducer }),
    provideEffects(usersEffects),
    UsersApi,
  ],
};
