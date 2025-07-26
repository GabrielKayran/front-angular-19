import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiResponseWithData } from '@shared/interfaces';
import { AuthenticateUserRequest, AuthenticateUserResponse } from '@app/clients/auth/auth.interface';
import { map, Observable } from 'rxjs';
import { BaseResponse } from '@core/class/base-response/base-response';
import { BYPASS_LOADING } from '@shared/components/loading/interceptors/loading.interceptor';

@Injectable({
	providedIn: 'root',
})
export class AuthClientService {
	private _baseUrl = environment.baseUrl + '/auth';

	private _http = inject(HttpClient);

	login(request: AuthenticateUserRequest, skipLoading?: boolean): Observable<AuthenticateUserResponse> {
		let params = new HttpParams();

		if (skipLoading) {
			params = params.set(BYPASS_LOADING, 'true');
		}

		return this._http
			.post<ApiResponseWithData<AuthenticateUserResponse>>(`${this._baseUrl}`, request, { params })
			.pipe(map(BaseResponse.extractResult));
	}
}
