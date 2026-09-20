import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, map } from "rxjs";
import { ProductDetailDto, ProductSummaryDto } from "./product.dto";
import { toProductDetail, toProductSummary } from "./product.mapper";
import { ProductDetail, ProductId, ProductSummary } from "./product.model";

@Injectable()
export class ProductsApi {
  private readonly http = inject(HttpClient);

  loadProducts(): Observable<ProductSummary[]> {
    return this.http
      .get<ProductSummaryDto[]>("/products.json")
      .pipe(map((dtos) => dtos.map(toProductSummary)));
  }

  loadProduct(productId: ProductId): Observable<ProductDetail> {
    return this.http
      .get<ProductDetailDto>(`/products/${productId}.json`)
      .pipe(map(toProductDetail));
  }
}
