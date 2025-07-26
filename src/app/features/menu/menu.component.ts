import { Component, inject, input, OnInit } from '@angular/core';
import { MatFabButton, MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { GlobalStateService } from '@core/services/global-state.service';
import { Router } from '@angular/router';

export interface MenuItem {
	label: string;
	icon: string;
	action: () => void;
}

@Component({
	selector: 'app-menu',
	imports: [MatIcon, MatIconButton, MatTooltip, MatFabButton],
	templateUrl: './menu.component.html',
	styleUrl: './menu.component.scss',
})
export class MenuComponent implements OnInit {
	private _globalState = inject(GlobalStateService);
	private _router = inject(Router);
	menuItems: MenuItem[] = [];
	isCollapsed = input<boolean | undefined>(false);

	user = this._globalState.user;

	ngOnInit() {
		this._globalState.populateUser$.subscribe(() => {
			this.buildMenuItems();
		});
	}

	private buildMenuItems() {
		if (this.user()?.role === 'Admin') {
			this.menuItems = [
				{
					label: 'Produtos',
					icon: 'inventory_2',
					action: () => this._router.navigate(['/admin/products']),
				},
				{
					label: 'Cadastrar Produto',
					icon: 'add_circle',
					action: () => this._router.navigate(['/admin/products/create']),
				},
			];
		} else {
			this.menuItems = [
				{
					label: 'Carrinho',
					icon: 'shopping_cart',
					action: () => this._router.navigate(['/cart']),
				},
				{
					label: 'Lista de Produtos',
					icon: 'list',
					action: () => this._router.navigate(['/products']),
				},
			];
		}
	}
}
