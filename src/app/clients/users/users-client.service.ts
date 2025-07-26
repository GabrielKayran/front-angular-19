import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { HttpClient } from '@angular/common/http';
import { CreateUserRequest, GetUserRequest } from '@app/clients/users/user.interface';
import { BaseResponse } from '@core/class/base-response/base-response';
import { ApiResponseWithData } from '@shared/interfaces';
import { map, Observable } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class UsersClientService {
	private _baseUrl = environment.baseUrl + '/users';

	private _http = inject(HttpClient);

	createUser(request: CreateUserRequest): Observable<GetUserRequest> {
		return this._http
			.post<ApiResponseWithData<GetUserRequest>>(`${this._baseUrl}`, request)
			.pipe(map(BaseResponse.extractResult));
	}
}
