import { Routes } from "@angular/router";

export const appRoutes: Routes = [
  {
    path: "",
    pathMatch: "full",
    redirectTo: "animals",
  },
  {
    path: "animals",
    loadChildren: () => import("@features/animals/animals.routes").then((m) => m.animalsRoutes),
  },
  {
    path: "**",
    redirectTo: "animals",
  },
];
