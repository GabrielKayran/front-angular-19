import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { GlobalStateService } from '@core/services/global-state.service';
import { MatTooltip } from '@angular/material/tooltip';
import { CartBadgeComponent } from '@shared/components/cart-badge/cart-badge.component';

@Component({
	selector: 'app-header',
	standalone: true,
	imports: [
		CommonModule,
		MatToolbarModule,
		MatIconModule,
		MatButtonModule,
		MatMenuModule,
		MatTooltip,
		CartBadgeComponent,
	],
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
	menuToggleEvent = output();
	logoutEvent = output();

	isCollapsed = input<boolean | undefined>(false);
	private _globalState = inject(GlobalStateService);

	user = this._globalState.user;

	public get tooltipText(): string {
		return this.isCollapsed() ? 'Abrir Menu' : 'Fechar Menu';
	}

	public toggleMenu(): void {
		this.menuToggleEvent.emit();
	}

	public logout(): void {
		this.logoutEvent.emit();
	}
}
