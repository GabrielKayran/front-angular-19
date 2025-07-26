// 💰 Interfaces para vendas

import { EntityStatus, PaginationParams } from '../../shared/interfaces/common.interface';

/**
 * Item de venda
 */
export interface SaleItem {
  productId: string;
  product: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalAmount: number;
}

/**
 * Request para criar venda
 */
export interface CreateSaleRequest {
  saleNumber: string;
  saleDate: string;
  customer: string;
  branch: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
  }[];
}

/**
 * Response da criação de venda
 */
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

/**
 * Request para buscar venda específica
 */
export interface GetSaleRequest {
  id: string;
}

/**
 * Response de venda específica
 */
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

/**
 * Request para listar vendas com paginação
 */
export interface GetSalesRequest extends PaginationParams {
  saleNumber?: string;
  customer?: string;
  branch?: string;
  status?: EntityStatus;
  startDate?: string;
  endDate?: string;
}

/**
 * DTO de item de venda para listagem
 */
export interface SaleItemResponseDto {
  id: string;
  product: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalAmount: number;
}

/**
 * DTO de venda para listagem
 */
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

/**
 * Response da listagem de vendas
 */
export interface GetSalesResponse {
  data: SaleResponseDto[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}

/**
 * Request para atualizar venda
 */
export interface UpdateSaleRequest {
  id: string;
  saleNumber?: string;
  saleDate?: string;
  customer?: string;
  branch?: string;
  status?: EntityStatus;
  items?: {
    productId: string;
    quantity: number;
    unitPrice: number;
  }[];
}

/**
 * Response da atualização de venda
 */
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

/**
 * Request para cancelar venda
 */
export interface CancelSaleRequest {
  id: string;
  reason?: string;
}
