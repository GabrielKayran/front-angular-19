import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { LoadingService } from './services/loading.service';

@Component({
	selector: 'app-loading',
	standalone: true,
	imports: [MatProgressSpinner],
	host: {
		'[class.overlay-loader]': 'loadingService.loadingSignal()',
		'[class.d-none]': '!loadingService.loadingSignal()',
	},
	templateUrl: './loading.component.html',
	styleUrl: './loading.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingComponent {
	public loadingService = inject(LoadingService);
}
