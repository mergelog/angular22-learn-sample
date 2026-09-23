import {
  createEnvironmentInjector,
  EnvironmentInjector,
  EnvironmentProviders,
  Injector,
  provideZonelessChangeDetection,
  Provider,
  TransferState,
  ɵINJECTOR_SCOPE,
} from '@angular/core';

export function createTerminalInjector(
  providers: Array<Provider | EnvironmentProviders>,
): EnvironmentInjector {
  return createEnvironmentInjector(
    [
      { provide: ɵINJECTOR_SCOPE, useValue: 'root' },
      { provide: TransferState, useFactory: () => new TransferState() },
      provideZonelessChangeDetection(),
      ...providers,
    ],
    Injector.NULL as EnvironmentInjector,
  );
}
