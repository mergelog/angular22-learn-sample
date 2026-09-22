import {
  createEnvironmentInjector,
  EnvironmentInjector,
  EnvironmentProviders,
  Injector,
  Provider,
} from '@angular/core';

export function createTerminalInjector(
  providers: Array<Provider | EnvironmentProviders>,
): EnvironmentInjector {
  return createEnvironmentInjector(providers, Injector.NULL as EnvironmentInjector);
}
