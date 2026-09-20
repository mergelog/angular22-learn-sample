import { Routes } from "@angular/router";

export const appRoutes: Routes = [
  {
    path: "",
    pathMatch: "full",
    redirectTo: "products",
  },
  {
    path: "products",
    loadChildren: () => import("@features/products/products.routes").then((m) => m.productsRoutes),
  },
  {
    path: "**",
    redirectTo: "products",
  },
];
