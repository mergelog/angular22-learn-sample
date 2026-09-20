export type ProductId = string;

export type ProductCategory = "kitchen" | "audio" | "furniture" | "unknown";

export interface ProductSummary {
  id: ProductId;
  name: string;
  price: number;
  category: ProductCategory;
}

export interface ProductDetail extends ProductSummary {
  description: string;
  stock: number;
}
