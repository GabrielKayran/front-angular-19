export interface ApiResponse {
	success: boolean;
	message?: string;
	errors: string[];
}

export interface ApiResponseWithData<T> extends ApiResponse {
	data: T;
}

export interface PaginatedResponse<T> extends ApiResponse {
	data: T[];
	totalItems?: number;
	totalCount?: number;
	currentPage?: number;
	page?: number;
	totalPages: number;
	hasNextPage?: boolean;
	hasPreviousPage?: boolean;
}

export interface PaginationParams {
	page?: number;
	pageSize?: number;
	sortBy?: string;
	sortDirection?: 'asc' | 'desc';
}

export type EntityStatus = 'Active' | 'Inactive' | 'Cancelled';

export type UserRole = 'Admin' | 'Manager' | 'Customer' | 'Employee';
