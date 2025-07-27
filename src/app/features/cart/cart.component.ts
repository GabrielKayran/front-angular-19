import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { CartService, CartProductWithDetails } from '@core/services/cart.service';
import { SalesClientService } from '@app/clients/sales/sales-client.service';
import { CreateSaleRequest } from '@app/clients/sales/sale.interface';
import { GlobalStateService } from '@core/services/global-state.service';
import { ImageFallbackDirective } from '@shared/directives/image-fallback.directive';
import { of, switchMap } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { MenuService } from '@core/services/menu.service';

@Component({
	selector: 'app-cart',
	standalone: true,
	imports: [
		CommonModule,
		MatCardModule,
		MatButtonModule,
		MatIconModule,
		MatProgressSpinnerModule,
		MatTooltipModule,
		NgOptimizedImage,
		ImageFallbackDirective,
	],
	templateUrl: './cart.component.html',
	styleUrl: './cart.component.scss',
})
export class CartComponent implements OnInit {
	private readonly _menuService = inject(MenuService);
	private readonly _cartService = inject(CartService);
	private readonly _snackBar = inject(MatSnackBar);
	private readonly _router = inject(Router);
	private readonly _salesService = inject(SalesClientService);
	private readonly _globalState = inject(GlobalStateService);

	public readonly cartCount = this._cartService.cartCount;
	public readonly isLoading = this._cartService.isLoading;

	public readonly cartItemsWithDetails = signal<CartProductWithDetails[]>([]);

	ngOnInit(): void {
		this._menuService.closeMenu();
		this._loadCartItemsWithDetails();
	}

	public updateQuantity(productId: string, quantity: number): void {
		this._cartService.updateProductQuantity(productId, quantity).subscribe({
			next: () => {
				this._snackBar.open('Quantidade atualizada!', 'Fechar', { duration: 3000 });
				this._loadCartItemsWithDetails();
			},
			error: () => {
				this._snackBar.open('Erro ao atualizar quantidade', 'Fechar', { duration: 3000 });
			},
		});
	}

	public removeItem(productId: string): void {
		this._cartService.removeFromCart(productId).subscribe({
			next: () => {
				this._snackBar.open('Item removido do carrinho!', 'Fechar', { duration: 3000 });
				this._loadCartItemsWithDetails();
			},
			error: () => {
				this._snackBar.open('Erro ao remover item', 'Fechar', { duration: 3000 });
			},
		});
	}

	public clearCart(): void {
		this._cartService.clearCart().subscribe({
			next: () => {
				this._snackBar.open('Carrinho limpo!', 'Fechar', { duration: 3000 });
				this.cartItemsWithDetails.set([]);
			},
			error: () => {
				this._snackBar.open('Erro ao limpar carrinho', 'Fechar', { duration: 3000 });
			},
		});
	}

	public getTotalPrice(): number {
		return this.cartItemsWithDetails().reduce((total: number, item: CartProductWithDetails) => {
			return total + item.product.price * item.quantity;
		}, 0);
	}

	public goToProducts(): void {
		this._router.navigate(['/products']);
	}

	public checkout(): void {
		const user = this._globalState.user();
		if (!user) {
			this._notify('Usuário não autenticado');
			return;
		}

		const cartItems = this.cartItemsWithDetails();
		if (cartItems.length === 0) {
			this._notify('Carrinho vazio');
			return;
		}

		const saleNumber = `SALE-${Date.now()}`;
		const saleRequest: CreateSaleRequest = {
			saleNumber,
			saleDate: new Date().toISOString(),
			customer: user.username,
			branch: 'Online Store',
			items: cartItems.map(item => ({
				productId: item.productId,
				product: item.product.title,
				quantity: item.quantity,
				unitPrice: item.product.price,
			})),
		};

		this._salesService
			.createSale(saleRequest)
			.pipe(
				tap(sale => {
					if (!sale) throw new Error('Erro ao processar venda');
				}),
				switchMap(sale =>
					this._cartService.clearCart().pipe(
						tap(() => {
							this.cartItemsWithDetails.set([]);
							this._notify(`Compra realizada com sucesso! Número da venda: ${sale.saleNumber}`, 5000);
							this._router.navigate(['/my-orders']);
						})
					)
				),
				catchError(() => {
					this._notify('Erro ao processar venda');
					return of();
				})
			)
			.subscribe();
	}

	private _loadCartItemsWithDetails(): void {
		this._cartService.getCartItemsWithDetails().subscribe({
			next: items => {
				this.cartItemsWithDetails.set(items);
			},
			error: () => {
				this._snackBar.open('Erro ao carregar produtos do carrinho', 'Fechar', { duration: 3000 });
			},
		});
	}

	private _notify(message: string, duration = 3000): void {
		this._snackBar.open(message, 'Fechar', { duration });
	}
}
