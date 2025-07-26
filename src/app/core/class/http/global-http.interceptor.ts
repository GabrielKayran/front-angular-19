import {
	HttpErrorResponse,
	HttpEvent,
	HttpHandlerFn,
	HttpInterceptorFn,
	HttpRequest,
	HttpStatusCode,
} from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { GlobalStateService } from '@core/services/global-state.service';
import { inject } from '@angular/core';

type IStatusAlert = Record<
	string,
	{
		title: string;
		icon: 'error' | 'warning' | 'info';
	}
>;

const STATUS_ALERT: IStatusAlert = {
	warning: {
		title: 'Alerta!',
		icon: 'warning',
	},
	error: {
		title: 'Error!',
		icon: 'error',
	},
};

export const KEY_BYPASS = 'bypass';

export const globalInterceptor: HttpInterceptorFn = (
	req: HttpRequest<any>,
	next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
	let clonedRequest = req;
	const globalState = inject(GlobalStateService);
	const token = globalState.token();

	if (clonedRequest.params.has(KEY_BYPASS)) {
		clonedRequest = clonedRequest.clone({
			params: clonedRequest.params.delete(KEY_BYPASS),
		});
		return next(clonedRequest);
	}

	if (token) {
		clonedRequest = clonedRequest.clone({
			setHeaders: {
				Authorization: `Bearer ${token}`,
			},
		});
	}

	return next(clonedRequest).pipe(catchError(error => errorHandler(error)));
};

function errorHandler(response: HttpErrorResponse): Observable<HttpEvent<unknown>> {
	let errorMessage = '';

	if (response.error) {
		errorMessage = builderErrorMessage(response.error);
	}

	switch (response.status) {
		case 0:
			showErrorMessages(errorMessage, 'error', 'Problemas com conexão com o servidor.').then();
			break;

		case HttpStatusCode.BadRequest:
			showErrorMessages(errorMessage, 'warning', 'Ocorreu um erro inesperado de servidor.').then();
			break;

		case HttpStatusCode.Unauthorized:
			showErrorMessages(
				errorMessage,
				'warning',
				'Você não está autorizado a acessar este recurso, faça login novamente.'
			).then(() => {
				window.location.href = '/';
			});
			break;

		case HttpStatusCode.Forbidden:
			showErrorMessages(
				errorMessage,
				'warning',
				'Acesso negado, você não tem permissão para realizar essa operação!'
			).then();
			break;

		case HttpStatusCode.NotFound:
			showErrorMessages(errorMessage, 'error', 'Houve algum erro, rota não encontrada.').then();
			break;

		case HttpStatusCode.PayloadTooLarge:
			showErrorMessages(errorMessage, 'error', 'Os dados enviados são grandes demais.').then();
			break;

		case HttpStatusCode.UnsupportedMediaType:
			showErrorMessages(errorMessage, 'error', 'Os dados enviados não são suportados.').then();
			break;

		case HttpStatusCode.TooManyRequests:
			showErrorMessages(errorMessage, 'error', 'Foram feitas muitas requisições em pouco tempo.').then();
			break;

		default:
			showErrorMessages(errorMessage, 'error', 'Ocorreu um erro inesperado de servidor.').then();
			break;
	}

	return throwError(() => response);
}

function builderErrorMessage(body: any): string {
	const possibleProperties = ['mensagemErro', 'mensagem', 'MensagemErro', 'message', 'errorMessages'];
	const property = possibleProperties.find(property => Object.prototype.hasOwnProperty.call(body, property));
	if (property) return body[property]?.toString();
	return 'Erro inesperado, tente novamente mais tarde.';
}

function showErrorMessages(message: string, status: 'error' | 'warning', defaultMessage?: string) {
	let messageAlert;
	const statusAlert = STATUS_ALERT[status];

	if (message !== '') {
		messageAlert = message;
	} else {
		messageAlert = defaultMessage;
	}

	return Swal.fire({
		title: statusAlert.title,
		html: `<div>${messageAlert}</div>`,
		icon: statusAlert.icon,
		confirmButtonText: 'Ok',
		scrollbarPadding: false,
	});
}
