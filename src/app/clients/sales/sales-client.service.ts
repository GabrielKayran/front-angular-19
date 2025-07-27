import { HttpParams } from '@angular/common/module.d-CnjH8Dlt';
import { inject, Injectable } from '@angular/core';
import { BYPASS_LOADING } from '@app/shared/components/loading/interceptors/loading.interceptor';
import { ApiResponseWithData, PaginatedResponse } from '@shared/interfaces';
import { BaseResponse } from '@core/class/base-response/base-response';
import { map, Observable } from 'rxjs';
import {
	CancelSaleRequest,
	CreateSaleRequest,
	CreateSaleResponse,
	GetSaleRequest,
	GetSaleResponse,
	GetSalesRequest,
	GetSalesResponse,
	UpdateSaleRequest,
	UpdateSaleResponse,
} from '@app/clients/sales/sale.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';

@Injectable({
	providedIn: 'root',
})
export class SalesClientService {
	private _baseUrl = environment.baseUrl + '/sales';

	private _http = inject(HttpClient);

	createSale(request: CreateSaleRequest): Observable<CreateSaleResponse> {
		return this._http
			.post<ApiResponseWithData<CreateSaleResponse>>(`${this._baseUrl}`, request)
			.pipe(map(BaseResponse.extractResult));
	}

	getSale(request: GetSaleRequest, skipLoading?: boolean): Observable<GetSaleResponse> {
		let params = new HttpParams();

		if (skipLoading) {
			params = params.set(BYPASS_LOADING, 'true');
		}

		return this._http
			.get<ApiResponseWithData<GetSaleResponse>>(`${this._baseUrl}/${request.id}`, { params })
			.pipe(map(BaseResponse.extractResult));
	}

	getSales(request: GetSalesRequest, skipLoading?: boolean): Observable<PaginatedResponse<GetSalesResponse>> {
		let params = new HttpParams()
			.set('page', (request.page || 1).toString())
			.set('pageSize', (request.pageSize || 10).toString());

		if (request.saleNumber) {
			params = params.set('saleNumber', request.saleNumber);
		}
		if (request.customer) {
			params = params.set('customer', request.customer);
		}
		if (request.branch) {
			params = params.set('branch', request.branch);
		}
		if (request.status) {
			params = params.set('status', request.status);
		}
		if (request.startDate) {
			params = params.set('startDate', request.startDate);
		}
		if (request.endDate) {
			params = params.set('endDate', request.endDate);
		}
		if (skipLoading) {
			params = params.set(BYPASS_LOADING, 'true');
		}

		return this._http.get<PaginatedResponse<GetSalesResponse>>(`${this._baseUrl}`, { params });
	}

	updateSale(request: UpdateSaleRequest, skipLoading?: boolean): Observable<UpdateSaleResponse> {
		const { id, ...updateData } = request;

		let params = new HttpParams();

		if (skipLoading) {
			params = params.set(BYPASS_LOADING, 'true');
		}

		return this._http
			.put<ApiResponseWithData<UpdateSaleResponse>>(`${this._baseUrl}/${id}`, updateData, { params })
			.pipe(map(BaseResponse.extractResult));
	}

	cancelSale(request: CancelSaleRequest, skipLoading?: boolean): Observable<void> {
		let params = new HttpParams();

		if (skipLoading) {
			params = params.set(BYPASS_LOADING, 'true');
		}

		const body = request.reason ? { reason: request.reason } : {};

		return this._http.patch<void>(`${this._baseUrl}/${request.id}/cancel`, body, { params });
	}
}
