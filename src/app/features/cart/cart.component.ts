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
import { ImageFallbackDirective } from '@shared/directives/image-fallback.directive';

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
	private readonly _cartService = inject(CartService);
	private readonly _snackBar = inject(MatSnackBar);
	private readonly _router = inject(Router);

	public readonly cartCount = this._cartService.cartCount;
	public readonly isLoading = this._cartService.isLoading;

	public readonly cartItemsWithDetails = signal<CartProductWithDetails[]>([]);

	ngOnInit(): void {
		this.loadCartItemsWithDetails();
	}

	/**
	 * Carrega os produtos do carrinho com detalhes completos
	 */
	private loadCartItemsWithDetails(): void {
		this._cartService.getCartItemsWithDetails().subscribe({
			next: items => {
				this.cartItemsWithDetails.set(items);
			},
			error: error => {
				console.error('Erro ao carregar produtos do carrinho:', error);
				this._snackBar.open('Erro ao carregar produtos do carrinho', 'Fechar', { duration: 3000 });
			},
		});
	}

	public updateQuantity(productId: string, quantity: number): void {
		this._cartService.updateProductQuantity(productId, quantity).subscribe({
			next: () => {
				this._snackBar.open('Quantidade atualizada!', 'Fechar', { duration: 3000 });
				// Recarrega os produtos com detalhes após atualização
				this.loadCartItemsWithDetails();
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
				// Recarrega os produtos com detalhes após remoção
				this.loadCartItemsWithDetails();
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

	public async checkout(): Promise<void> {
		this._snackBar.open('Funcionalidade de checkout em desenvolvimento', 'Fechar', { duration: 3000 });
	}
}
