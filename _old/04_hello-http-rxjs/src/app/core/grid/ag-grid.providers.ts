import {
  EnvironmentProviders,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
} from "@angular/core";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";

/**
 * AG Grid v33 以降は、使用する機能をモジュールとして明示的に登録する必要がある。
 * 登録はアプリ全体で 1 回だけでよいので、core の provider として切り出しておく。
 */
export function provideAgGrid(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideEnvironmentInitializer(() => {
      ModuleRegistry.registerModules([AllCommunityModule]);
    }),
  ]);
}
