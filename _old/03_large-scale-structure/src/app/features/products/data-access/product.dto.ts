export interface ProductSummaryDto {
  product_id: string;
  product_name: string;
  unit_price: number;
  category_code: string;
}

export interface ProductDetailDto extends ProductSummaryDto {
  description: string;
  stock_quantity: number;
}
