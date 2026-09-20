import { EntityState, createEntityAdapter } from "@ngrx/entity";
import { createFeature, createReducer, on } from "@ngrx/store";
import { RequestStatus } from "@shared/models/request-status";
import { ProductCategory, ProductDetail, ProductSummary } from "../data-access/product.model";
import {
  ProductDetailPageActions,
  ProductListPageActions,
  ProductsApiActions,
} from "./products.actions";

export const productsAdapter = createEntityAdapter<ProductSummary>({
  selectId: (product: ProductSummary) => product.id,
  sortComparer: (a: ProductSummary, b: ProductSummary) => a.name.localeCompare(b.name, "ja"),
});

export interface ProductsState extends EntityState<ProductSummary> {
  listStatus: RequestStatus;
  listError: string | null;
  categoryFilter: ProductCategory | null;
  detail: ProductDetail | null;
  detailStatus: RequestStatus;
  detailError: string | null;
}

const initialState: ProductsState = productsAdapter.getInitialState({
  listStatus: "idle" as RequestStatus,
  listError: null as string | null,
  categoryFilter: null as ProductCategory | null,
  detail: null as ProductDetail | null,
  detailStatus: "idle" as RequestStatus,
  detailError: null as string | null,
});

export const productsFeature = createFeature({
  name: "products",
  reducer: createReducer(
    initialState,

    on(
      ProductListPageActions.opened,
      ProductListPageActions.refreshClicked,
      (state): ProductsState => ({
        ...state,
        listStatus: "loading",
        listError: null,
      }),
    ),

    on(ProductsApiActions.loadProductsSucceeded, (state, { products }): ProductsState =>
      productsAdapter.setAll(products, {
        ...state,
        listStatus: "success",
        listError: null,
      }),
    ),

    on(ProductsApiActions.loadProductsFailed, (state, { error }): ProductsState => ({
      ...state,
      listStatus: "error",
      listError: error,
    })),

    on(ProductListPageActions.categoryFilterChanged, (state, { category }): ProductsState => ({
      ...state,
      categoryFilter: category,
    })),

    on(ProductDetailPageActions.opened, (state): ProductsState => ({
      ...state,
      detail: null,
      detailStatus: "loading",
      detailError: null,
    })),

    on(ProductsApiActions.loadProductSucceeded, (state, { product }): ProductsState => ({
      ...state,
      detail: product,
      detailStatus: "success",
      detailError: null,
    })),

    on(ProductsApiActions.loadProductFailed, (state, { error }): ProductsState => ({
      ...state,
      detail: null,
      detailStatus: "error",
      detailError: error,
    })),
  ),
});
