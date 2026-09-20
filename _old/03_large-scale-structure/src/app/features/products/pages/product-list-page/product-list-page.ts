import { ChangeDetectionStrategy, Component, OnInit, inject } from "@angular/core";
import { Store } from "@ngrx/store";
import { ErrorBanner } from "@shared/ui/error-banner/error-banner";
import { Spinner } from "@shared/ui/spinner/spinner";
import { ProductTable } from "../../components/product-table/product-table";
import { ProductCategory } from "../../data-access/product.model";
import { PRODUCT_CATEGORY_LABELS } from "../../product-category.labels";
import { ProductListPageActions } from "../../store/products.actions";
import { ProductsSelectors } from "../../store/products.selectors";

@Component({
  selector: "app-product-list-page",
  templateUrl: "./product-list-page.html",
  styleUrl: "./product-list-page.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ErrorBanner, ProductTable, Spinner],
})
export class ProductListPage implements OnInit {
  private readonly store = inject(Store);

  protected readonly products = this.store.selectSignal(ProductsSelectors.selectFilteredProducts);
  protected readonly categories = this.store.selectSignal(
    ProductsSelectors.selectAvailableCategories,
  );
  protected readonly categoryFilter = this.store.selectSignal(
    ProductsSelectors.selectCategoryFilter,
  );
  protected readonly isLoading = this.store.selectSignal(ProductsSelectors.selectIsListLoading);
  protected readonly error = this.store.selectSignal(ProductsSelectors.selectListError);

  protected readonly categoryLabels = PRODUCT_CATEGORY_LABELS;

  ngOnInit(): void {
    this.store.dispatch(ProductListPageActions.opened());
  }

  protected onCategoryChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    const category = value === "" ? null : (value as ProductCategory);
    this.store.dispatch(ProductListPageActions.categoryFilterChanged({ category }));
  }

  protected onRefresh(): void {
    this.store.dispatch(ProductListPageActions.refreshClicked());
  }
}
