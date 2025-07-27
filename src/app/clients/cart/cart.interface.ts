import { PaginationParams } from '@shared/interfaces';

export interface CartProduct {
	productId: string;
	quantity: number;
}

export interface CreateCartRequest {
	cartId?: string;
	userId: string;
	date: string;
	products: CartProduct[];
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

export interface UpdateCartRequest {
	id: string;
	userId?: string;
	date?: string;
	products?: CartProduct[];
}

export interface UpdateCartResponse {
	id: string;
	userId: string;
	date: string;
	products: CartProduct[];
	updatedAt: string;
}
