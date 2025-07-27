import { EntityStatus, PaginationParams } from '@shared/interfaces';

export interface SaleItem extends SimpleSaleItem {
	discount: number;
	totalAmount: number;
}
export interface SimpleSaleItem {
	productId: string;
	product: string;
	quantity: number;
	unitPrice: number;
}

export interface CreateSaleRequest {
	saleNumber: string;
	saleDate: string;
	customer: string;
	branch: string;
	items: SimpleSaleItem[];
}

export interface CreateSaleResponse {
	id: string;
	saleNumber: string;
	saleDate: string;
	customer: string;
	branch: string;
	status: EntityStatus;
	totalAmount: number;
	items: SaleItem[];
	createdAt: string;
	updatedAt: string;
}

export interface GetSaleRequest {
	id: string;
}

export interface GetSaleResponse {
	id: string;
	saleNumber: string;
	saleDate: string;
	customer: string;
	branch: string;
	status: EntityStatus;
	totalAmount: number;
	items: SaleItem[];
	createdAt: string;
	updatedAt: string;
}

export interface GetSalesRequest extends PaginationParams {
	saleNumber?: string;
	customer?: string;
	branch?: string;
	status?: EntityStatus;
	startDate?: string;
	endDate?: string;
}

export interface SaleItemResponseDto {
	id: string;
	product: string;
	quantity: number;
	unitPrice: number;
	discount: number;
	totalAmount: number;
}

export interface SaleResponseDto {
	id: string;
	saleNumber: string;
	saleDate: string;
	customer: string;
	branch: string;
	status: EntityStatus;
	totalAmount: number;
	createdAt: string;
	updatedAt: string;
	items: SaleItemResponseDto[];
}

export interface GetSalesResponse {
	data: SaleResponseDto[];
	totalItems: number;
	currentPage: number;
	totalPages: number;
}

export interface UpdateSaleRequest {
	id: string;
	saleNumber?: string;
	saleDate?: string;
	customer?: string;
	branch?: string;
	status?: EntityStatus;
	items?: SimpleSaleItem[];
}

export interface UpdateSaleResponse {
	id: string;
	saleNumber: string;
	saleDate: string;
	customer: string;
	branch: string;
	status: EntityStatus;
	totalAmount: number;
	items: SaleItem[];
	updatedAt: string;
}

export interface CancelSaleRequest {
	id: string;
	reason?: string;
}
