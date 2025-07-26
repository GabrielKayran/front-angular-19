import { PaginationParams } from '../../shared/interfaces';


export interface CartProduct {
  productId: string;
  quantity: number;
}

export interface CreateCartRequest {
  userId: string;
  date: string;
  products: {
    productId: string;
    quantity: number;
  }[];
}

export interface CreateCartResponse {
  id: string;
  userId: string;
  date: string;
  products: CartProduct[];
  createdAt: string;
  updatedAt: string;
}

export interface GetCartRequest {
  id: string;
}

export interface GetCartResponse {
  id: string;
  userId: string;
  date: string;
  products: CartProduct[];
  createdAt: string;
  updatedAt: string;
}

export interface GetCartsRequest extends PaginationParams {
  userId?: string;
  startDate?: string;
  endDate?: string;
}


export interface GetCartsProductResponseDto {
  productId: string;
  quantity: number;
}


export interface GetCartsResponseDto {
  id: string;
  userId: string;
  date: string;
  products: GetCartsProductResponseDto[];
  createdAt: string;
  updatedAt: string;
}

export interface GetCartsResponse {
  data: GetCartsResponseDto[];
  totalCount: number;
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}


export interface UpdateCartRequest {
  id: string;
  userId?: string;
  date?: string;
  products?: {
    productId: string;
    quantity: number;
  }[];
}

export interface UpdateCartResponse {
  id: string;
  userId: string;
  date: string;
  products: CartProduct[];
  updatedAt: string;
}

