import { inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, map, of, switchMap } from "rxjs";
import { toApiErrorMessage } from "@core/http/api-error";
import { ProductsApi } from "../data-access/products.api";
import {
  ProductDetailPageActions,
  ProductListPageActions,
  ProductsApiActions,
} from "./products.actions";

const loadProducts = createEffect(
  (actions$ = inject(Actions), productsApi = inject(ProductsApi)) =>
    actions$.pipe(
      ofType(ProductListPageActions.opened, ProductListPageActions.refreshClicked),
      switchMap(() =>
        productsApi.loadProducts().pipe(
          map((products) => ProductsApiActions.loadProductsSucceeded({ products })),
          catchError((error: unknown) =>
            of(ProductsApiActions.loadProductsFailed({ error: toApiErrorMessage(error) })),
          ),
        ),
      ),
    ),
  { functional: true },
);

const loadProduct = createEffect(
  (actions$ = inject(Actions), productsApi = inject(ProductsApi)) =>
    actions$.pipe(
      ofType(ProductDetailPageActions.opened),
      switchMap(({ productId }) =>
        productsApi.loadProduct(productId).pipe(
          map((product) => ProductsApiActions.loadProductSucceeded({ product })),
          catchError((error: unknown) =>
            of(ProductsApiActions.loadProductFailed({ error: toApiErrorMessage(error) })),
          ),
        ),
      ),
    ),
  { functional: true },
);

export const productsEffects = {
  loadProducts,
  loadProduct,
};
