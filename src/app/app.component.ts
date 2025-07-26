import { Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { GlobalStateService } from '@core/services/global-state.service';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { NgClass } from '@angular/common';
import { MenuComponent } from '@app/features/menu/menu.component';
import { HeaderComponent } from '@shared/components/header/header.component';
import { filter } from 'rxjs/operators';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
	imports: [
		LoadingComponent,
		RouterOutlet,
		MatIconButton,
		MatIcon,
		MatSidenavContainer,
		MatSidenav,
		NgClass,
		MatSidenavContent,
		MenuComponent,
		HeaderComponent,
	],
})
export class AppComponent implements OnInit {
	@HostListener('window:resize')
	public onResize(): void {
		this._verifyMobile();
	}
	public hasUser = signal(false);
	public isCollapsed = signal(false);
	public isMobile = signal(false);
	public showSidenav = signal(true);

	private readonly _globalStateService = inject(GlobalStateService);
	private _router = inject(Router);

	ngOnInit(): void {
		this._getSessionToken();
		this._setupRouteListener();
	}

	toggleCollapse() {
		this.isCollapsed.set(!this.isCollapsed());
	}

	logout(): void {
		this._globalStateService.token.set('');
		localStorage.removeItem('auth_token');

		this._router.navigate(['/login']);
	}

	private _verifyMobile(): void {
		this.isMobile.set(window.innerWidth <= 768);
	}

	private _setupRouteListener(): void {
		this._router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
			const authRoutes = ['/login', '/register'];
			const isAuthRoute = authRoutes.some(route => event.url.includes(route));
			this.showSidenav.set(!isAuthRoute);
		});
	}

	private _getSessionToken() {
		const token = sessionStorage.getItem('access_token');
		if (token) {
			sessionStorage.removeItem('access_token');
			this._globalStateService.token.set(token);
		}
		this.hasUser.set(!!this._globalStateService.token());
	}
}
