import { inject, Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
	providedIn: 'root',
})
export class CartClientService {
	private _baseUrl = environment.baseUrl + '/carts';

	private _http = inject(HttpClient);
}
