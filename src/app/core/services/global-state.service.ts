import { computed, Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { UserModel } from '@app/clients/users';
import { jwtDecode } from 'jwt-decode';
import { UserRole } from '@shared/interfaces';

export interface DecodedToken {
	nameid: string;
	unique_name: string;
	role: UserRole;
	nbf: number;
	exp: number;
	iat: number;
}

@Injectable({
	providedIn: 'root',
})
export class GlobalStateService {
	token = signal('');

	constructor() {
		this.initializeToken();
	}

	user = computed<UserModel | null>(() => {
		const decodedToken = this._decodedToken(this.token());
		if (!decodedToken) return null;

		return {
			id: decodedToken.nameid,
			username: decodedToken.unique_name,
			role: decodedToken.role,
		};
	});

	populateUser$ = toObservable(this.user);

	public setToken(token: string): void {
		this.token.set(token);
		sessionStorage.setItem('auth_token', token);
	}

	public initializeToken(): void {
		const authToken = sessionStorage.getItem('auth_token');

		if (authToken) {
			this.token.set(authToken);
		}
	}

	public clearToken(): void {
		this.token.set('');
		sessionStorage.removeItem('auth_token');
	}

	private _decodedToken(token: string): DecodedToken | null {
		if (!token) return null;

		return jwtDecode(token);
	}
}
