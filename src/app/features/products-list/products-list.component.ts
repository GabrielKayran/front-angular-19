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
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import {
	AddToCartDialogComponent,
	AddToCartDialogData,
	AddToCartDialogResult,
} from '@shared/components/add-to-cart-dialog/add-to-cart-dialog.component';
import { CartService } from '@core/services/cart.service';

import { ProductsClientService } from '@app/clients/products/products-client.service';
import { ImageFallbackDirective } from '@shared/directives/image-fallback.directive';
import { MenuService } from '@core/services/menu.service';
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
		MatBadgeModule,
		ReactiveFormsModule,
		NgOptimizedImage,
		ImageFallbackDirective,
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
	private _dialog = inject(MatDialog);
	private _cartService = inject(CartService);
	private _menuService = inject(MenuService);

	products = signal<GetProductsResponseDto[]>([]);
	categories = signal<string[]>([]);
	totalCount = signal(0);
	currentPage = signal(1);
	pageSize = signal(10);
	loading = signal(false);
	hasMoreData = signal(true);
	scrollDistance = signal(2);

	public readonly isCartLoading = this._cartService.isLoading;

	get isAdminMode(): boolean {
		return this._router.url.includes('/admin');
	}

	filterForm: FormGroup<FilterFormControls> = this._fb.group({
		title: this._fb.control('', { nonNullable: true }),
		category: this._fb.control('', { nonNullable: true }),
		minPrice: this._fb.control('', { nonNullable: true }),
		maxPrice: this._fb.control('', { nonNullable: true }),
	});

	ngOnInit(): void {
		this._closeMenu();
		this._checkAdminAccess();
		this._loadCategories();
		this._loadProducts();
	}

	public get isFilterFormEmpty(): boolean {
		const { title, category, minPrice, maxPrice } = this.filterForm.value;
		return !title && !category && !minPrice && !maxPrice;
	}

	public get headerConfig() {
		return {
			title: this.isAdminMode ? 'Gerenciar Produtos' : 'Catálogo de Produtos',
			icon: this.isAdminMode ? 'inventory_2' : 'store',
		};
	}

	public get emptyStateConfig() {
		return {
			title: this.isAdminMode ? 'Nenhum produto encontrado' : 'Nenhum produto disponível',
			description: this.isAdminMode
				? 'Não há produtos cadastrados ou que atendam aos filtros aplicados.'
				: 'Não há produtos disponíveis no momento ou que atendam aos filtros aplicados.',
		};
	}

	public getProductQuantity(productId: string): number {
		return this._cartService.getProductQuantity(productId);
	}

	public isProductInCart(productId: string): boolean {
		return this._cartService.isProductInCart(productId);
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
				error: () => {
					this._snackBar.open('Erro ao excluir produto', 'Fechar', {
						duration: 3000,
						panelClass: ['error-snackbar'],
					});
				},
			});
		}
	}

	public addToCart(product: GetProductsResponseDto): void {
		const currentQuantity = this.getProductQuantity(product.id);
		const dialogData: AddToCartDialogData = {
			product,
			currentQuantity,
		};

		const dialogRef = this._dialog.open(AddToCartDialogComponent, {
			width: '500px',
			maxWidth: '90vw',
			data: dialogData,
			disableClose: false,
			autoFocus: true,
		});

		dialogRef.afterClosed().subscribe(result => {
			if (result) {
				this._handleCartAction(product, result);
			}
		});
	}

	private _handleCartAction(product: GetProductsResponseDto, result: AddToCartDialogResult): void {
		let serviceCall;
		let successMessage = '';
		let errorMessage = '';

		switch (result.action) {
			case 'add':
				serviceCall = this._cartService.addToCart(product.id, result.quantity);
				successMessage = `${product.title} adicionado ao carrinho! (${result.quantity} ${result.quantity === 1 ? 'item' : 'itens'})`;
				errorMessage = 'Erro ao adicionar produto ao carrinho. Tente novamente.';
				break;

			case 'update':
				serviceCall = this._cartService.updateProductQuantity(product.id, result.quantity);
				successMessage = `Quantidade de ${product.title} atualizada! (${result.quantity} ${result.quantity === 1 ? 'item' : 'itens'})`;
				errorMessage = 'Erro ao atualizar quantidade. Tente novamente.';
				break;

			case 'remove':
				serviceCall = this._cartService.removeFromCart(product.id);
				successMessage = `${product.title} removido do carrinho!`;
				errorMessage = 'Erro ao remover produto do carrinho. Tente novamente.';
				break;

			default:
				return;
		}

		serviceCall.subscribe({
			next: () => {
				this._snackBar.open(successMessage, 'Fechar', {
					duration: 4000,
					panelClass: ['success-snackbar'],
				});
			},
			error: () => {
				this._snackBar.open(errorMessage, 'Fechar', {
					duration: 4000,
					panelClass: ['error-snackbar'],
				});
			},
		});
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
				const currentProducts = this.products();
				const newProducts = response.data || [];

				if (this.currentPage() === 1) {
					this.products.set(newProducts);
				} else {
					this.products.set([...currentProducts, ...newProducts]);
				}

				this.totalCount.set(response.totalCount || 0);

				const totalLoaded = this.products().length;
				const hasMore = totalLoaded < (response.totalCount || 0);
				this.hasMoreData.set(hasMore);

				this.loading.set(false);
			},
			error: () => {
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
		});
	}

	private _closeMenu(): void {
		this._menuService.closeMenu();
	}

	private _checkAdminAccess(): void {
		const currentUrl = this._router.url;
		const isAdminRoute = currentUrl.includes('/admin');
		if (isAdminRoute) {
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
	}
}
