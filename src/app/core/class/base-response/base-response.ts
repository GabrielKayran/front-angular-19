import { ApiResponseWithData, PaginatedResponse } from '@shared/interfaces';

export abstract class BaseResponse {
	static extractResult<T>(response: ApiResponseWithData<T>): T {
		if (!response.success) throw new Error(response.errors.join(', '));

		return response.data;
	}

	static extractPaginatedResponse<T>(response: PaginatedResponse<T>): T[] {
		if (response.errors) throw new Error(response.errors.join(', '));

		return response.data;
	}
}
