import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { ProductsClientService } from '@app/clients/products/products-client.service';
import {
	GetProductsRequest,
	GetProductsResponseDto,
	GetCategoriesResponse,
} from '@app/clients/products/product.interface';
import { GlobalStateService } from '@core/services/global-state.service';
import { PaginatedResponse } from '@shared/interfaces';

interface FilterFormControls {
	title: FormControl<string>;
	category: FormControl<string>;
	minPrice: FormControl<string>;
	maxPrice: FormControl<string>;
}

@Component({
	selector: 'app-products-list',
	standalone: true,
	imports: [
		CommonModule,
		MatTableModule,
		MatButtonModule,
		MatIconModule,
		MatInputModule,
		MatFormFieldModule,
		MatSelectModule,
		InfiniteScrollDirective,
		MatCardModule,
		MatToolbarModule,
		MatDialogModule,
		MatSnackBarModule,
		MatProgressSpinnerModule,
		MatChipsModule,
		MatTooltipModule,
		ReactiveFormsModule,
		NgOptimizedImage,
	],
	templateUrl: './products-list.component.html',
	styleUrls: ['./products-list.component.scss'],
})
export class ProductsListComponent implements OnInit {
	private _productsService = inject(ProductsClientService);
	private _globalState = inject(GlobalStateService);
	private _router = inject(Router);
	private _snackBar = inject(MatSnackBar);
	private _fb = inject(FormBuilder);

	products = signal<GetProductsResponseDto[]>([]);
	categories = signal<string[]>([]);
	totalCount = signal(0);
	currentPage = signal(1);
	pageSize = signal(10);
	loading = signal(false);
	hasMoreData = signal(true);
	scrollDistance = signal(2);

	filterForm: FormGroup<FilterFormControls> = this._fb.group({
		title: this._fb.control('', { nonNullable: true }),
		category: this._fb.control('', { nonNullable: true }),
		minPrice: this._fb.control('', { nonNullable: true }),
		maxPrice: this._fb.control('', { nonNullable: true }),
	});

	ngOnInit(): void {
		this._checkAdminAccess();
		this._loadCategories();
		this._loadProducts();
	}

	public get isFilterFormEmpty(): boolean {
		const { title, category, minPrice, maxPrice } = this.filterForm.value;
		return !title && !category && !minPrice && !maxPrice;
	}

	public onScrollDown(): void {
		if (this.hasMoreData() && !this.loading()) {
			this.currentPage.set(this.currentPage() + 1);
			this._loadProducts();
		}
	}

	public editProduct(product: GetProductsResponseDto): void {
		this._router.navigate(['/admin/products/edit', product.id]);
	}

	public deleteProduct(product: GetProductsResponseDto): void {
		if (confirm(`Tem certeza que deseja excluir o produto "${product.title}"?`)) {
			this._productsService.deleteProduct(product.id).subscribe({
				next: () => {
					this._snackBar.open('Produto excluído com sucesso!', 'Fechar', {
						duration: 3000,
						panelClass: ['success-snackbar'],
					});
					this._loadProducts();
				},
				error: error => {
					console.error('Erro ao excluir produto:', error);
					this._snackBar.open('Erro ao excluir produto', 'Fechar', {
						duration: 3000,
						panelClass: ['error-snackbar'],
					});
				},
			});
		}
	}

	public onSearch(): void {
		this.currentPage.set(1);
		this.products.set([]);
		this.hasMoreData.set(true);
		this._loadProducts();
	}

	public clearFilters(): void {
		this.filterForm.reset();
		this.currentPage.set(1);
		this.products.set([]);
		this.hasMoreData.set(true);
		this._loadProducts();
	}

	private _loadProducts(): void {
		if (this.loading() || !this.hasMoreData()) {
			return;
		}

		this.loading.set(true);
		const formValue = this.filterForm.getRawValue();
		const request: GetProductsRequest = {
			page: this.currentPage(),
			pageSize: this.pageSize(),
			title: formValue.title || undefined,
			category: formValue.category || undefined,
			minPrice: formValue.minPrice ? Number(formValue.minPrice) : undefined,
			maxPrice: formValue.maxPrice ? Number(formValue.maxPrice) : undefined,
		};

		this._productsService.getProducts(request, true).subscribe({
			next: (response: PaginatedResponse<GetProductsResponseDto>) => {
				console.log(response);
				const currentProducts = this.products();
				const newProducts = response.data || [];

				if (this.currentPage() === 1) {
					this.products.set(newProducts);
				} else {
					this.products.set([...currentProducts, ...newProducts]);
				}

				this.totalCount.set(response.totalCount || 0);

				const totalLoaded = this.products().length;
				console.log(response);
				const hasMore = totalLoaded < (response.totalCount || 0);
				this.hasMoreData.set(hasMore);

				this.loading.set(false);
			},
			error: error => {
				console.error('Erro ao carregar produtos:', error);
				this._snackBar.open('Erro ao carregar produtos', 'Fechar', {
					duration: 3000,
					panelClass: ['error-snackbar'],
				});
				this.loading.set(false);
			},
		});
	}

	private _loadCategories(): void {
		this._productsService.getCategories().subscribe({
			next: (response: GetCategoriesResponse) => {
				this.categories.set(response.categories);
			},
			error: error => {
				console.error('Erro ao carregar categorias:', error);
			},
		});
	}

	private _checkAdminAccess(): void {
		const user = this._globalState.user();
		if (!user || user.role !== 'Admin') {
			this._router.navigate(['/dashboard']);
			this._snackBar.open('Acesso negado. Apenas administradores podem acessar esta página.', 'Fechar', {
				duration: 5000,
				panelClass: ['error-snackbar'],
			});
		}
	}
}
