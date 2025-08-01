import { Component, inject, input, OnInit } from '@angular/core';
import { MatFabButton, MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { GlobalStateService } from '@core/services/global-state.service';
import { Router } from '@angular/router';

export interface MenuItem {
	label: string;
	icon: string;
	route: string;
	action: () => void;
}

@Component({
	selector: 'app-menu',
	imports: [MatIcon, MatIconButton, MatTooltip, MatFabButton],
	templateUrl: './menu.component.html',
	styleUrl: './menu.component.scss',
})
export class MenuComponent implements OnInit {
	private readonly _globalState = inject(GlobalStateService);
	private readonly _router = inject(Router);

	menuItems: MenuItem[] = [];
	isCollapsed = input<boolean | undefined>(false);

	user = this._globalState.user;

	ngOnInit() {
		this._globalState.populateUser$.subscribe(() => {
			this._buildMenuItems();
		});
	}

	public isRouteActive(route: string): boolean {
		return this._router.url === route;
	}

	private _buildMenuItems() {
		if (this.user()?.role === 'Admin') {
			this.menuItems = [
				{
					label: 'Produtos',
					icon: 'inventory_2',
					route: '/admin/products',
					action: () => this._router.navigate(['/admin/products']),
				},
				{
					label: 'Cadastrar Produto',
					icon: 'add_circle',
					route: '/admin/products/create',
					action: () => this._router.navigate(['/admin/products/create']),
				},
				{
					label: 'Vendas',
					icon: 'point_of_sale',
					route: '/admin/sales',
					action: () => this._router.navigate(['/admin/sales']),
				},
			];
		} else {
			this.menuItems = [
				{
					label: 'Lista de Produtos',
					icon: 'list',
					route: '/products',
					action: () => this._router.navigate(['/products']),
				},
				{
					label: 'Carrinho',
					icon: 'shopping_cart',
					route: '/cart',
					action: () => this._router.navigate(['/cart']),
				},
				{
					label: 'Meus Pedidos',
					icon: 'receipt_long',
					route: '/my-orders',
					action: () => this._router.navigate(['/my-orders']),
				},
			];
		}
	}
}
