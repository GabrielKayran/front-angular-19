import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { SalesClientService } from '@app/clients/sales/sales-client.service';
import { GlobalStateService } from '@core/services/global-state.service';
import { GetSalesRequest, SaleResponseDto } from '@app/clients/sales/sale.interface';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MenuService } from '@core/services/menu.service';
import { SaleCardComponent } from '@shared/components/sale-card/sale-card.component';

@Component({
	selector: 'app-my-orders',
	standalone: true,
	imports: [
		CommonModule,
		MatCardModule,
		MatButtonModule,
		MatIconModule,
		MatChipsModule,
		MatProgressSpinnerModule,
		MatDividerModule,
		MatTooltipModule,
		InfiniteScrollDirective,
		SaleCardComponent,
	],
	templateUrl: './my-orders.component.html',
	styleUrls: ['./my-orders.component.scss'],
})
export class MyOrdersComponent implements OnInit {
	private readonly _salesService = inject(SalesClientService);
	private readonly _globalState = inject(GlobalStateService);
	private readonly _router = inject(Router);
	private readonly _snackBar = inject(MatSnackBar);
	private readonly _menuService = inject(MenuService);

	public readonly orders = signal<SaleResponseDto[]>([]);
	public readonly loading = signal(false);
	public readonly totalCount = signal(0);
	public readonly currentPage = signal(1);
	public readonly pageSize = signal(10);
	public readonly hasMoreData = signal(true);

	ngOnInit(): void {
		this._closeMenu();
		this._loadOrders();
	}

	public goToProducts(): void {
		this._router.navigate(['/products']);
	}

	public onScrollDown(): void {
		if (!this.loading() && this.hasMoreData()) {
			const scrollContainer = document.querySelector('.mat-drawer-content');
			const currentScrollTop = scrollContainer?.scrollTop || 0;

			this.currentPage.set(this.currentPage() + 1);

			this._loadOrders(true);

			setTimeout(() => {
				if (scrollContainer) {
					scrollContainer.scrollTop = currentScrollTop;
				}
			}, 50);
		}
	}

	private _closeMenu(): void {
		this._menuService.closeMenu();
	}

	private _loadOrders(append = false): void {
		const user = this._globalState.user();
		if (!user) {
			this._router.navigate(['/login']);
			return;
		}

		this.loading.set(true);

		const request: GetSalesRequest = {
			page: this.currentPage(),
			pageSize: this.pageSize(),
			customer: user.username,
		};

		this._salesService.getSales(request, true).subscribe({
			next: response => {
				const newOrders = response.data || [];

				if (append) {
					this.orders.set([...this.orders(), ...newOrders]);
				} else {
					this.orders.set(newOrders);
				}

				this.totalCount.set(response.totalCount || 0);

				const totalLoaded = this.orders().length;
				this.hasMoreData.set(totalLoaded < this.totalCount());

				this.loading.set(false);
			},
			error: () => {
				this._snackBar.open('Erro ao carregar pedidos', 'Fechar', { duration: 3000 });
				this.loading.set(false);
			},
		});
	}
}
