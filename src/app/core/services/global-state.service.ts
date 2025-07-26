import { computed, Injectable, signal } from '@angular/core';
import { fromEvent, take } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import Swal from 'sweetalert2';
import { UserModel } from '@app/clients/users';
import { jwtDecode } from 'jwt-decode';
import { UserRole } from '@shared/interfaces';

const SHARED_DATA_EVENT = 'shared-data';

export interface DecodedToken {
	userId: string;
	username: string;
	userRole: UserRole;
	nbf: number;
	exp: number;
	iat: number;
}

@Injectable({
	providedIn: 'root',
})
export class GlobalStateService {
	token = signal('');

	user = computed<UserModel | null>(() => {
		const decodedToken = this._decodedToken(this.token());
		if (!decodedToken) return null;

		return {
			id: decodedToken.userId,
			username: decodedToken.username,
			role: decodedToken.userRole,
		};
	});

	populateUser$ = toObservable(this.user);

	public setToken(token: string): void {
		this.token.set(token);
		sessionStorage.setItem('auth_token', token);
	}

	private _decodedToken(token: string): DecodedToken | null {
		if (!token) return null;

		return jwtDecode(token);
	}

	listenerSharedData(): void {
		fromEvent<CustomEvent<{ tokenV3: string }>>(window, SHARED_DATA_EVENT)
			.pipe(take(1))
			.subscribe(({ detail }) => {
				if (detail.tokenV3) {
					this.token.set(detail.tokenV3);
				} else {
					Swal.fire({
						title: 'Sessão expirada',
						html: `<div>Para usar o Mottu Chip, saia e entre novamente no app.<br><br> Toque na sua foto, selecione 'Sair', faça login novamente e acesse o Mottu Chip</div>`,
						icon: 'info',
						confirmButtonText: 'Ok',
						scrollbarPadding: false,
					}).then(() => {
						window.location.href = '/';
					});
				}
			});
	}
}
