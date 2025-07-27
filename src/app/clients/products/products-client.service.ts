import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
	CreateProductRequest,
	CreateProductResponse,
	GetProductRequest,
	GetProductResponse,
	GetProductsRequest,
	UpdateProductRequest,
	UpdateProductResponse,
	GetCategoriesResponse,
	GetProductsResponseDto,
} from '@app/clients/products/product.interface';
import { map, Observable } from 'rxjs';
import { ApiResponseWithData, PaginatedResponse } from '@shared/interfaces';
import { BaseResponse } from '@core/class/base-response/base-response';
import { BYPASS_LOADING } from '@shared/components/loading/interceptors/loading.interceptor';

@Injectable({
	providedIn: 'root',
})
export class ProductsClientService {
	private _baseUrl = environment.baseUrl + '/products';

	private _http = inject(HttpClient);

	createProduct(request: CreateProductRequest): Observable<CreateProductResponse> {
		return this._http
			.post<ApiResponseWithData<CreateProductResponse>>(`${this._baseUrl}`, request)
			.pipe(map(BaseResponse.extractResult));
	}

	getProduct(request: GetProductRequest, skipLoading?: boolean): Observable<GetProductResponse> {
		let params = new HttpParams();

		if (skipLoading) {
			params = params.set(BYPASS_LOADING, 'true');
		}

		return this._http
			.get<ApiResponseWithData<GetProductResponse>>(`${this._baseUrl}/${request.id}`, { params })
			.pipe(map(BaseResponse.extractResult));
	}

	getProducts(
		request: GetProductsRequest,
		skipLoading?: boolean
	): Observable<PaginatedResponse<GetProductsResponseDto>> {
		let params = new HttpParams()
			.set('page', (request.page || 1).toString())
			.set('pageSize', (request.pageSize || 10).toString());

		if (request.title) {
			params = params.set('title', request.title);
		}
		if (request.category) {
			params = params.set('category', request.category);
		}
		if (request.minPrice) {
			params = params.set('minPrice', request.minPrice.toString());
		}
		if (request.maxPrice) {
			params = params.set('maxPrice', request.maxPrice.toString());
		}
		if (skipLoading) {
			params = params.set(BYPASS_LOADING, 'true');
		}

		return this._http.get<PaginatedResponse<GetProductsResponseDto>>(`${this._baseUrl}`, { params });
	}

	updateProduct(request: UpdateProductRequest): Observable<UpdateProductResponse> {
		const { id, ...updateData } = request;
		return this._http
			.put<ApiResponseWithData<UpdateProductResponse>>(`${this._baseUrl}/${id}`, updateData)
			.pipe(map(BaseResponse.extractResult));
	}

	deleteProduct(id: string): Observable<void> {
		return this._http.delete<void>(`${this._baseUrl}/${id}`);
	}

	getCategories(): Observable<GetCategoriesResponse> {
		return this._http
			.get<ApiResponseWithData<GetCategoriesResponse>>(`${this._baseUrl}/categories`)
			.pipe(map(BaseResponse.extractResult));
	}
}
