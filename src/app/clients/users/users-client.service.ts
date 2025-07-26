import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CreateUserRequest, GetUserRequest } from '@app/clients/users/user.interface';
import { BaseResponse } from '@core/class/base-response/base-response';
import { ApiResponseWithData } from '@shared/interfaces';
import { map, Observable } from 'rxjs';
import { BYPASS_LOADING } from '@shared/components/loading/interceptors/loading.interceptor';

@Injectable({
	providedIn: 'root',
})
export class UsersClientService {
	private _baseUrl = environment.baseUrl + '/users';

	private _http = inject(HttpClient);

	createUser(request: CreateUserRequest, skipLoading?: boolean): Observable<GetUserRequest> {
		let params = new HttpParams();

		if (skipLoading) {
			params = params.set(BYPASS_LOADING, 'true');
		}

		return this._http
			.post<ApiResponseWithData<GetUserRequest>>(`${this._baseUrl}`, request, { params })
			.pipe(map(BaseResponse.extractResult));
	}
}
