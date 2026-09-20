import { Routes } from "@angular/router";
import { provideAgGrid } from "@core/grid/ag-grid.providers";
import { AnimalsApi } from "./data-access/animals.api";
import { AnimalsStore } from "./store/animals.store";

export const animalsRoutes: Routes = [
  {
    path: "",
    /**
     * API と store をこのルート配下に閉じ込める。
     * root に置かないことで、feature を離れたときに状態ごと破棄される。
     *
     * AG Grid の登録もここで行う。app.config.ts に置くと ag-grid 本体が
     * 初期バンドルへ引き込まれ、グリッドを使わない画面まで重くなる。
     */
    providers: [provideAgGrid(), AnimalsApi, AnimalsStore],
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
