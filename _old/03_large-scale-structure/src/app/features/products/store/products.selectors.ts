import { createSelector } from "@ngrx/store";
import { ProductCategory } from "../data-access/product.model";
import { productsAdapter, productsFeature } from "./products.reducer";

const { selectAll, selectEntities, selectTotal } = productsAdapter.getSelectors(
  productsFeature.selectProductsState,
);

const selectFilteredProducts = createSelector(
  selectAll,
  productsFeature.selectCategoryFilter,
  (products, categoryFilter) =>
    categoryFilter === null
      ? products
      : products.filter((product) => product.category === categoryFilter),
);

const selectAvailableCategories = createSelector(selectAll, (products): ProductCategory[] => [
  ...new Set(products.map((product) => product.category)),
]);

const selectIsListLoading = createSelector(
  productsFeature.selectListStatus,
  (status) => status === "loading",
);

const selectIsDetailLoading = createSelector(
  productsFeature.selectDetailStatus,
  (status) => status === "loading",
);

export const ProductsSelectors = {
  selectAllProducts: selectAll,
  selectProductEntities: selectEntities,
  selectProductCount: selectTotal,
  selectFilteredProducts,
  selectAvailableCategories,
  selectCategoryFilter: productsFeature.selectCategoryFilter,
  selectIsListLoading,
  selectListError: productsFeature.selectListError,
  selectDetail: productsFeature.selectDetail,
  selectIsDetailLoading,
  selectDetailError: productsFeature.selectDetailError,
};
