import { Component, inject, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';
import { GlobalStateService } from '@core/services/global-state.service';
import { Router } from '@angular/router';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
	selector: 'app-dashboard',
	imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatToolbarModule, MatTooltip],
	templateUrl: './dashboard.component.html',
	styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
	private _globalState = inject(GlobalStateService);
	private _router = inject(Router);

	user = this._globalState.user;

	ngOnInit(): void {
		const token = sessionStorage.getItem('auth_token');
		if (token) {
			this._globalState.token.set(token);
		} else {
			this._router.navigate(['/login']);
		}
	}

	logout(): void {
		this._globalState.token.set('');
		localStorage.removeItem('auth_token');

		this._router.navigate(['/login']);
	}
}
