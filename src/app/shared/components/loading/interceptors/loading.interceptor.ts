import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoadingService } from '../services/loading.service';
import { finalize } from 'rxjs';

export const BYPASS_LOADING = 'bypass_loading';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
	let clonedRequest = req;
	const loadingService = inject(LoadingService);

	if (clonedRequest.params.has(BYPASS_LOADING)) {
		clonedRequest = clonedRequest.clone({
			params: clonedRequest.params.delete(BYPASS_LOADING),
		});
		return next(clonedRequest);
	}

	loadingService.setLoading(true, req.url);

	return next(req).pipe(finalize(() => loadingService.setLoading(false, req.url)));
};
