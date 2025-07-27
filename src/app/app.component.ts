import { Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { LoadingComponent } from '@shared/components/loading/loading.component';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { GlobalStateService } from '@core/services/global-state.service';
import { MenuService } from '@core/services/menu.service';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { NgClass } from '@angular/common';
import { MenuComponent } from '@shared/components/menu/menu.component';
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
	public isMobile = signal(false);
	public showSidenav = signal(true);

	private readonly _globalStateService = inject(GlobalStateService);
	private readonly _menuService = inject(MenuService);
	private readonly _router = inject(Router);

	public readonly isMenuOpen = this._menuService.isMenuOpen;

	ngOnInit(): void {
		this._getSessionToken();
		this._setupRouteListener();
		this._checkAuthRoute(this._router.url);
	}

	public toggleMenu(): void {
		this._menuService.toggleMenu();
	}

	public logout(): void {
		this._globalStateService.clearToken();
		this.hasUser.set(false);
		this._router.navigate(['/login']);
	}

	private _verifyMobile(): void {
		this.isMobile.set(window.innerWidth <= 768);
	}

	private _checkAuthRoute(url: string): void {
		const authRoutes = ['/login', '/register'];
		const isAuthRoute = authRoutes.includes(url);
		this.showSidenav.set(!isAuthRoute);
	}

	private _setupRouteListener(): void {
		this._router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((event: NavigationEnd) => {
			this._checkAuthRoute(event.urlAfterRedirects);
		});
	}

	private _getSessionToken() {
		this.hasUser.set(!!this._globalStateService.token());
	}
}
