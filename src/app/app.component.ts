import { Component, inject, OnInit } from '@angular/core';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { RouterOutlet } from '@angular/router';
import { GlobalStateService } from '@core/services/global-state.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
	imports: [LoadingComponent, RouterOutlet],
})
export class AppComponent implements OnInit {
	title = 'ambev-frontend';

	private readonly _globalStateService = inject(GlobalStateService);

	ngOnInit(): void {
		this._getSessionToken();
	}

	private _getSessionToken() {
		const token = sessionStorage.getItem('access_token');
		if (token) {
			sessionStorage.removeItem('access_token');
			this._globalStateService.token.set(token);
		}
	}
}
