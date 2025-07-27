import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';

import { CartService } from '@core/services/cart.service';

@Component({
	selector: 'app-cart-badge',
	standalone: true,
	imports: [CommonModule, MatButtonModule, MatIconModule, MatBadgeModule, MatTooltipModule],
	templateUrl: './cart-badge.component.html',
	styleUrl: './cart-badge.component.scss',
})
export class CartBadgeComponent {
	public cartService = inject(CartService);
	private _router = inject(Router);

	public readonly cartCount = this.cartService.cartCount;

	public goToCart(): void {
		this._router.navigate(['/cart']);
	}
}
