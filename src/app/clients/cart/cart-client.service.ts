import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CreateCartRequest, GetCartResponse, GetCartsRequest } from '@app/clients/cart/cart.interface';
import { ApiResponseWithData, PaginatedResponse } from '@shared/interfaces';
import { map, Observable } from 'rxjs';
import { BaseResponse } from '@core/class/base-response/base-response';

@Injectable({
	providedIn: 'root',
})
export class CartClientService {
	private _baseUrl = environment.baseUrl + '/carts';

	private _http = inject(HttpClient);

	getAllCarts(request: GetCartsRequest) {
		let params = new HttpParams()
			.set('page', (request.page || 1).toString())
			.set('pageSize', (request.pageSize || 10).toString());

		if (request.userId) {
			params = params.set('userId', request.userId);
		}

		if (request.startDate) {
			params = params.set('startDate', request.startDate);
		}

		if (request.endDate) {
			params = params.set('endDate', request.endDate);
		}

		return this._http.get<PaginatedResponse<GetCartResponse>>(`${this._baseUrl}`, { params });
	}

	getCart(id: string): Observable<GetCartResponse> {
		return this._http
			.get<ApiResponseWithData<GetCartResponse>>(`${this._baseUrl}/${id}`)
			.pipe(map(BaseResponse.extractResult));
	}

	getMyCart(): Observable<GetCartResponse> {
		return this._http
			.get<ApiResponseWithData<GetCartResponse>>(`${this._baseUrl}/my-cart`)
			.pipe(map(BaseResponse.extractResult));
	}

	createCart(request: CreateCartRequest): Observable<GetCartResponse> {
		return this._http
			.post<ApiResponseWithData<GetCartResponse>>(`${this._baseUrl}`, request)
			.pipe(map(BaseResponse.extractResult));
	}

	updateCart(request: CreateCartRequest): Observable<GetCartResponse> {
		return this._http
			.put<ApiResponseWithData<GetCartResponse>>(`${this._baseUrl}/${request.cartId}`, request)
			.pipe(map(BaseResponse.extractResult));
	}

	deleteCart(id: string): Observable<void> {
		return this._http.delete<ApiResponseWithData<void>>(`${this._baseUrl}/${id}`).pipe(map(BaseResponse.extractResult));
	}
}
