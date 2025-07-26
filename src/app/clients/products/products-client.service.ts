import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { HttpClient } from '@angular/common/http';
import { CreateProductRequest, CreateProductResponse } from '@app/clients/products/product.interface';
import { map, Observable } from 'rxjs';
import { ApiResponseWithData } from '@shared/interfaces';
import { BaseResponse } from '@core/class/base-response/base-response';

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
}
