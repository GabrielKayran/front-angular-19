import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { SalesClientService } from '@app/clients/sales/sales-client.service';
import { GlobalStateService } from '@core/services/global-state.service';
import { GetSalesRequest, SaleResponseDto, CancelSaleRequest } from '@app/clients/sales/sale.interface';
import { EntityStatus } from '@shared/interfaces/common.interface';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MenuService } from '@core/services/menu.service';
import { SaleCardComponent } from '@shared/components/sale-card/sale-card.component';

interface SalesFilterFormControls {
	saleNumber: FormControl<string>;
	customer: FormControl<string>;
	branch: FormControl<string>;
	status: FormControl<string>;
}

interface DateRangeFormControls {
	start: FormControl<Date | null>;
	end: FormControl<Date | null>;
}

@Component({
	selector: 'app-sales-management',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		MatCardModule,
		MatButtonModule,
		MatIconModule,
		MatChipsModule,
		MatProgressSpinnerModule,
		MatDividerModule,
		MatTooltipModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		MatDatepickerModule,
		MatNativeDateModule,
		MatDialogModule,
		InfiniteScrollDirective,
		SaleCardComponent,
	],
	templateUrl: './sales-management.component.html',
	styleUrls: ['./sales-management.component.scss'],
})
export class SalesManagementComponent implements OnInit {
	private readonly _salesClientService = inject(SalesClientService);
	private readonly _globalState = inject(GlobalStateService);
	private readonly _router = inject(Router);
	private readonly _snackBar = inject(MatSnackBar);
	private readonly _menuService = inject(MenuService);
	private readonly _fb = inject(FormBuilder);

	public readonly sales = signal<SaleResponseDto[]>([]);
	public readonly loading = signal(false);
	public readonly totalCount = signal(0);
	public readonly currentPage = signal(1);
	public readonly pageSize = signal(10);
	public readonly hasMoreData = signal(true);

	public filterForm: FormGroup<SalesFilterFormControls> = this._fb.group<SalesFilterFormControls>({
		saleNumber: this._fb.control('', { nonNullable: true }),
		customer: this._fb.control('', { nonNullable: true }),
		branch: this._fb.control('', { nonNullable: true }),
		status: this._fb.control('', { nonNullable: true }),
	});

	public dateRangeGroup: FormGroup<DateRangeFormControls> = this._fb.group<DateRangeFormControls>({
		start: this._fb.control<Date | null>(null),
		end: this._fb.control<Date | null>(null),
	});

	public readonly statusOptions = [
		{ value: '', label: 'Todos os Status' },
		{ value: 'Active', label: 'Ativo' },
		{ value: 'Cancelled', label: 'Cancelado' },
	];

	ngOnInit(): void {
		this._checkAdminAccess();
		this._closeMenu();
		this._loadSales();
	}

	private _closeMenu(): void {
		this._menuService.closeMenu();
	}

	private _checkAdminAccess(): void {
		const user = this._globalState.user();
		if (!user || user.role !== 'Admin') {
			this._router.navigate(['/products']);
			this._snackBar.open('Acesso negado. Apenas administradores podem acessar esta página.', 'Fechar', {
				duration: 5000,
				panelClass: ['error-snackbar'],
			});
			return;
		}
	}

	public onFilterChange(): void {
		this.currentPage.set(1);
		this.hasMoreData.set(true);
		this._loadSales();
	}

	public onScrollDown(): void {
		if (!this.loading() && this.hasMoreData()) {
			const scrollContainer = document.querySelector('.mat-drawer-content');
			const currentScrollTop = scrollContainer?.scrollTop || 0;

			this.currentPage.set(this.currentPage() + 1);
			this._loadSales(true);

			setTimeout(() => {
				if (scrollContainer) {
					scrollContainer.scrollTop = currentScrollTop;
				}
			}, 50);
		}
	}

	public clearFilters(): void {
		this.filterForm.reset();
		this.dateRangeGroup.reset();
		this.currentPage.set(1);
		this.hasMoreData.set(true);
		this._loadSales();
	}

	public cancelSale(sale: SaleResponseDto): void {
		const request: CancelSaleRequest = {
			id: sale.id,
		};

		this._salesClientService.cancelSale(request).subscribe({
			next: () => {
				this._snackBar.open(`Venda ${sale.saleNumber} cancelada com sucesso!`, 'Fechar', { duration: 3000 });
				this._loadSales();
			},
			error: () => {
				this._snackBar.open('Erro ao cancelar venda', 'Fechar', { duration: 3000 });
			},
		});
	}

	public formatCurrency(value: number): string {
		return new Intl.NumberFormat('pt-BR', {
			style: 'currency',
			currency: 'BRL',
		}).format(value);
	}

	public get isFilterFormEmpty(): boolean {
		const { saleNumber, customer, branch, status } = this.filterForm.value;
		const { start, end } = this.dateRangeGroup.value;
		return !saleNumber && !customer && !branch && !status && !start && !end;
	}

	public getTotalSalesAmount(): number {
		return this.sales().reduce((total, sale) => total + sale.totalAmount, 0);
	}

	private _loadSales(append = false): void {
		this.loading.set(true);

		const formValue = this.filterForm.value;
		const dateRangeValue = this.dateRangeGroup.value;
		const request: GetSalesRequest = {
			page: this.currentPage(),
			pageSize: this.pageSize(),
			saleNumber: formValue.saleNumber || undefined,
			customer: formValue.customer || undefined,
			branch: formValue.branch || undefined,
			status: (formValue.status as EntityStatus) || undefined,
			startDate: dateRangeValue.start ? dateRangeValue.start.toISOString() : undefined,
			endDate: dateRangeValue.end ? dateRangeValue.end.toISOString() : undefined,
		};

		this._salesClientService.getSales(request, true).subscribe({
			next: response => {
				const newSales = response.data || [];

				if (append) {
					this.sales.set([...this.sales(), ...newSales]);
				} else {
					this.sales.set(newSales);
				}

				this.totalCount.set(response.totalCount || 0);

				const totalLoaded = this.sales().length;
				this.hasMoreData.set(totalLoaded < this.totalCount());

				this.loading.set(false);
			},
			error: () => {
				this._snackBar.open('Erro ao carregar vendas', 'Fechar', { duration: 3000 });
				this.loading.set(false);
			},
		});
	}
}
