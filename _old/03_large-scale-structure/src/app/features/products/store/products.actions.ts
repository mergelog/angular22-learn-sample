import { createActionGroup, emptyProps, props } from "@ngrx/store";
import {
  ProductCategory,
  ProductDetail,
  ProductId,
  ProductSummary,
} from "../data-access/product.model";

export const ProductListPageActions = createActionGroup({
  source: "Product List Page",
  events: {
    Opened: emptyProps(),
    "Refresh Clicked": emptyProps(),
    "Category Filter Changed": props<{ category: ProductCategory | null }>(),
  },
});

export const ProductDetailPageActions = createActionGroup({
  source: "Product Detail Page",
  events: {
    Opened: props<{ productId: ProductId }>(),
  },
});

export const ProductsApiActions = createActionGroup({
  source: "Products API",
  events: {
    "Load Products Succeeded": props<{ products: ProductSummary[] }>(),
    "Load Products Failed": props<{ error: string }>(),
    "Load Product Succeeded": props<{ product: ProductDetail }>(),
    "Load Product Failed": props<{ error: string }>(),
  },
});
