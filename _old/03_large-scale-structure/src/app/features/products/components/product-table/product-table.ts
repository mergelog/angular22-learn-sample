import { CurrencyPipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { ProductSummary } from "../../data-access/product.model";
import { PRODUCT_CATEGORY_LABELS } from "../../product-category.labels";

@Component({
  selector: "app-product-table",
  templateUrl: "./product-table.html",
  styleUrl: "./product-table.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, RouterLink],
})
export class ProductTable {
  readonly products = input.required<ProductSummary[]>();

  protected readonly categoryLabels = PRODUCT_CATEGORY_LABELS;
}
