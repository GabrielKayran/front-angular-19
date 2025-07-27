import { ApiResponseWithData } from '@shared/interfaces';

export abstract class BaseResponse {
	static extractResult<T>(response: ApiResponseWithData<T>): T {
		if (!response.success) throw new Error(response.errors.join(', '));

		return response.data;
	}
}
