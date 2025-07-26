import { ApplicationConfig, DEFAULT_CURRENCY_CODE, LOCALE_ID, provideZoneChangeDetection } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { globalInterceptor } from '@core/class/http/global-http.interceptor';
import { loadingInterceptor } from '@shared/components/loading/interceptors/loading.interceptor';
import { provideRouter } from '@angular/router';
import { routes } from '@app/app.routes';
import { provideNgxMask } from 'ngx-mask';

export const appConfig: ApplicationConfig = {
	providers: [
		provideZoneChangeDetection({ eventCoalescing: true }),
		provideRouter(routes),
		provideHttpClient(withInterceptors([globalInterceptor, loadingInterceptor]), withFetch()),
		provideNgxMask(),
		{
			provide: LOCALE_ID,
			useValue: 'pt-BR',
		},
		{
			provide: DEFAULT_CURRENCY_CODE,
			useValue: 'BRL',
		},
	],
};
