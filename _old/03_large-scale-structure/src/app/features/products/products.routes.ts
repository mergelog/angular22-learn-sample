import { Routes } from "@angular/router";
import { provideEffects } from "@ngrx/effects";
import { provideState } from "@ngrx/store";
import { ProductsApi } from "./data-access/products.api";
import { productsEffects } from "./store/products.effects";
import { productsFeature } from "./store/products.reducer";

export const productsRoutes: Routes = [
  {
    path: "",
    providers: [provideState(productsFeature), provideEffects(productsEffects), ProductsApi],
    children: [
      {
        path: "",
        title: "商品一覧",
        loadComponent: () =>
          import("./pages/product-list-page/product-list-page").then((m) => m.ProductListPage),
      },
      {
        path: ":id",
        title: "商品詳細",
        loadComponent: () =>
          import("./pages/product-detail-page/product-detail-page").then(
            (m) => m.ProductDetailPage,
          ),
      },
    ],
  },
];
