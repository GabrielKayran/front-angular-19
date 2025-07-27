import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { CartService } from '@core/services/cart.service';
import { ProductsClientService } from '@app/clients/products/products-client.service';
import { GetProductResponse } from '@app/clients/products/product.interface';
import { firstValueFrom } from 'rxjs';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
	selector: 'app-cart',
	standalone: true,
	imports: [
		CommonModule,
		MatCardModule,
		MatButtonModule,
		MatIconModule,
		MatListModule,
		MatDividerModule,
		MatProgressSpinnerModule,
		MatTooltip,
	],
	templateUrl: './cart.component.html',
	styleUrl: './cart.component.scss',
})
export class CartComponent {
	private readonly _cartService = inject(CartService);
	private readonly _productsClientService = inject(ProductsClientService);
	private readonly _snackBar = inject(MatSnackBar);
	private readonly _router = inject(Router);

	public readonly cartItems = this._cartService.cartItems;
	public readonly cartCount = this._cartService.cartCount;
	public readonly isLoading = this._cartService.isLoading;

	private productDetailsCache = new Map<string, GetProductResponse>();

	public async getProductDetails(productId: string): Promise<GetProductResponse | null> {
		if (this.productDetailsCache.has(productId)) {
			return this.productDetailsCache.get(productId)!;
		}

		try {
			const product = await firstValueFrom(this._productsClientService.getProduct({ id: productId }));
			this.productDetailsCache.set(productId, product);
			return product;
		} catch (error) {
			console.error('Erro ao carregar detalhes do produto:', error);
			return null;
		}
	}

	public async updateQuantity(productId: string, quantity: number): Promise<void> {
		try {
			await this._cartService.updateProductQuantity(productId, quantity);
			this._snackBar.open('Quantidade atualizada!', 'Fechar', { duration: 3000 });
		} catch {
			this._snackBar.open('Erro ao atualizar quantidade', 'Fechar', { duration: 3000 });
		}
	}

	public async removeItem(productId: string): Promise<void> {
		try {
			await this._cartService.removeFromCart(productId);
			this._snackBar.open('Item removido do carrinho!', 'Fechar', { duration: 3000 });
		} catch {
			this._snackBar.open('Erro ao remover item', 'Fechar', { duration: 3000 });
		}
	}

	public async clearCart(): Promise<void> {
		try {
			await this._cartService.clearCart();
			this._snackBar.open('Carrinho limpo!', 'Fechar', { duration: 3000 });
		} catch {
			this._snackBar.open('Erro ao limpar carrinho', 'Fechar', { duration: 3000 });
		}
	}

	public getTotalPrice(): number {
		return this.cartItems().reduce((total, item) => {
			const product = this.productDetailsCache.get(item.productId);
			return total + (product ? product.price * item.quantity : 0);
		}, 0);
	}

	public goToProducts(): void {
		this._router.navigate(['/products']);
	}

	public async checkout(): Promise<void> {
		this._snackBar.open('Funcionalidade de checkout em desenvolvimento', 'Fechar', { duration: 3000 });
	}
}
