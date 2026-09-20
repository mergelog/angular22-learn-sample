import { ProductDetailDto, ProductSummaryDto } from "./product.dto";
import { ProductCategory, ProductDetail, ProductSummary } from "./product.model";

const KNOWN_CATEGORIES: readonly ProductCategory[] = ["kitchen", "audio", "furniture"];

function toProductCategory(code: string): ProductCategory {
  return KNOWN_CATEGORIES.includes(code as ProductCategory) ? (code as ProductCategory) : "unknown";
}

export function toProductSummary(dto: ProductSummaryDto): ProductSummary {
  return {
    id: dto.product_id,
    name: dto.product_name,
    price: dto.unit_price,
    category: toProductCategory(dto.category_code),
  };
}

export function toProductDetail(dto: ProductDetailDto): ProductDetail {
  return {
    ...toProductSummary(dto),
    description: dto.description,
    stock: dto.stock_quantity,
  };
}
