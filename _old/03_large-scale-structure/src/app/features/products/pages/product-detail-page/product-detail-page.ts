import { CurrencyPipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, effect, inject, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { Store } from "@ngrx/store";
import { ErrorBanner } from "@shared/ui/error-banner/error-banner";
import { Spinner } from "@shared/ui/spinner/spinner";
import { ProductId } from "../../data-access/product.model";
import { PRODUCT_CATEGORY_LABELS } from "../../product-category.labels";
import { ProductDetailPageActions } from "../../store/products.actions";
import { ProductsSelectors } from "../../store/products.selectors";

@Component({
  selector: "app-product-detail-page",
  templateUrl: "./product-detail-page.html",
  styleUrl: "./product-detail-page.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, ErrorBanner, RouterLink, Spinner],
})
export class ProductDetailPage {
  private readonly store = inject(Store);

  readonly id = input.required<ProductId>();

  protected readonly detail = this.store.selectSignal(ProductsSelectors.selectDetail);
  protected readonly isLoading = this.store.selectSignal(ProductsSelectors.selectIsDetailLoading);
  protected readonly error = this.store.selectSignal(ProductsSelectors.selectDetailError);

  protected readonly categoryLabels = PRODUCT_CATEGORY_LABELS;

  constructor() {
    effect(() => {
      this.store.dispatch(ProductDetailPageActions.opened({ productId: this.id() }));
    });
  }
}
