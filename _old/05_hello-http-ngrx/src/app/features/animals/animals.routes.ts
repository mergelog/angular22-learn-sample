import { Routes } from "@angular/router";
import { provideEffects } from "@ngrx/effects";
import { provideState } from "@ngrx/store";
import { provideAgGrid } from "@core/grid/ag-grid.providers";
import { AnimalsApi } from "./data-access/animals.api";
import { animalsEffects } from "./store/animals.effects";
import { animalsFeature } from "./store/animals.reducer";

export const animalsRoutes: Routes = [
  {
    path: "",
    /**
     * state・effect・API をこのルート配下に閉じ込める。
     * root に置かないことで、feature の chunk を読むまで reducer もロードされない。
     *
     * AG Grid の登録もここで行う。app.config.ts に置くと ag-grid 本体が
     * 初期バンドルへ引き込まれ、グリッドを使わない画面まで重くなる。
     */
    providers: [
      provideAgGrid(),
      provideState(animalsFeature),
      provideEffects(animalsEffects),
      AnimalsApi,
    ],
    children: [
      {
        path: "",
        title: "動物一覧",
        loadComponent: () =>
          import("./pages/animal-list-page/animal-list-page").then((m) => m.AnimalListPage),
      },
    ],
  },
];
