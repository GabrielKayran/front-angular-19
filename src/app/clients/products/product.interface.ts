import { PaginationParams } from '@shared/interfaces';

export interface ProductRating {
  rate: number;
  count: number;
}

export interface CreateProductRequest {
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: ProductRating;
}

export interface CreateProductResponse {
  id: string;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: ProductRating;
  createdAt: string;
  updatedAt: string;
}

export interface GetProductRequest {
  id: string;
}

export interface GetProductResponse {
  id: string;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: ProductRating;
  createdAt: string;
  updatedAt: string;
}

export interface GetProductsRequest extends PaginationParams {
  title?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface GetProductsResponseDto {
  id: string;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: ProductRating;
  createdAt: string;
  updatedAt: string;
}

export interface GetProductsResponse {
  data: Array<GetProductsResponseDto>;
  totalCount: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface UpdateProductRequest {
  id: string;
  title?: string;
  price?: number;
  description?: string;
  category?: string;
  image?: string;
  rating?: ProductRating;
}

export interface UpdateProductResponse {
  id: string;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: ProductRating;
  updatedAt: string;
}

export interface GetCategoriesResponse {
  categories: Array<string>;
}
