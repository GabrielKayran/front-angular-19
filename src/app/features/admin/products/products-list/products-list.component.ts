import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { ProductsClientService } from '@app/clients/products/products-client.service';
import {
	GetProductsRequest,
	GetProductsResponseDto,
	GetCategoriesResponse,
} from '@app/clients/products/product.interface';
import { GlobalStateService } from '@core/services/global-state.service';
import { PaginatedResponse } from '@shared/interfaces';

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
		MatPaginatorModule,
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
	currentPage = signal(0);
	pageSize = signal(10);

	filterForm: FormGroup;

	constructor() {
		this.filterForm = this._fb.group({
			title: [''],
			category: [''],
			minPrice: [''],
			maxPrice: [''],
		});

		this.filterForm.valueChanges.pipe(debounceTime(500), distinctUntilChanged()).subscribe(() => {
			this.currentPage.set(0);
			this.loadProducts();
		});
	}

	ngOnInit(): void {
		this._checkAdminAccess();
		this.loadCategories();
		this.loadProducts();
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

	loadProducts(): void {
		const formValue = this.filterForm.value;
		const request: GetProductsRequest = {
			page: this.currentPage() + 1,
			pageSize: this.pageSize(),
			title: formValue.title || undefined,
			category: formValue.category || undefined,
			minPrice: formValue.minPrice ? Number(formValue.minPrice) : undefined,
			maxPrice: formValue.maxPrice ? Number(formValue.maxPrice) : undefined,
		};

		this._productsService.getProducts(request).subscribe({
			next: (response: PaginatedResponse<GetProductsResponseDto>) => {
				console.log(response);
				this.products.set(response.data);
				this.totalCount.set(response.totalCount || 0);
			},
			error: error => {
				console.error('Erro ao carregar produtos:', error);
				this._snackBar.open('Erro ao carregar produtos', 'Fechar', {
					duration: 3000,
					panelClass: ['error-snackbar'],
				});
			},
		});
	}

	loadCategories(): void {
		this._productsService.getCategories().subscribe({
			next: (response: GetCategoriesResponse) => {
				this.categories.set(response.categories);
			},
			error: error => {
				console.error('Erro ao carregar categorias:', error);
			},
		});
	}

	onPageChange(event: PageEvent): void {
		this.currentPage.set(event.pageIndex);
		this.pageSize.set(event.pageSize);
		this.loadProducts();
	}

	clearFilters(): void {
		this.filterForm.reset();
		this.currentPage.set(0);
		this.loadProducts();
	}

	createProduct(): void {
		this._router.navigate(['/admin/products/create']);
	}

	editProduct(product: GetProductsResponseDto): void {
		this._router.navigate(['/admin/products/edit', product.id]);
	}

	deleteProduct(product: GetProductsResponseDto): void {
		if (confirm(`Tem certeza que deseja excluir o produto "${product.title}"?`)) {
			this._productsService.deleteProduct(product.id).subscribe({
				next: () => {
					this._snackBar.open('Produto excluído com sucesso!', 'Fechar', {
						duration: 3000,
						panelClass: ['success-snackbar'],
					});
					this.loadProducts();
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

	formatPrice(price: number): string {
		return new Intl.NumberFormat('pt-BR', {
			style: 'currency',
			currency: 'BRL',
		}).format(price);
	}

	getRatingDisplay(rating: { rate: number; count: number }): string {
		return `${rating.rate.toFixed(1)} (${rating.count})`;
	}
}
