import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { GetProductsResponseDto } from '@app/clients/products/product.interface';
import { MatTooltip } from '@angular/material/tooltip';

export interface AddToCartDialogData {
	product: GetProductsResponseDto;
	currentQuantity?: number;
}

export interface AddToCartDialogResult {
	quantity: number;
	action: 'add' | 'update' | 'remove';
}

@Component({
	selector: 'app-add-to-cart-dialog',
	standalone: true,
	imports: [
		CommonModule,
		MatDialogModule,
		MatButtonModule,
		MatIconModule,
		MatFormFieldModule,
		MatInputModule,
		FormsModule,
		MatTooltip,
	],
	templateUrl: './add-to-cart-dialog.component.html',
	styleUrl: './add-to-cart-dialog.component.scss',
})
export class AddToCartDialogComponent implements OnInit {
	public readonly dialogRef = inject(MatDialogRef<AddToCartDialogComponent>);
	public readonly data = inject(MAT_DIALOG_DATA) as AddToCartDialogData;
	public readonly quantity = signal(1);
	public readonly currentQuantityInCart = signal(0);

	ngOnInit(): void {
		this._checkCurrentQuantity();
	}

	public getTotalPrice(): number {
		return this.data.product.price * this.quantity();
	}

	public incrementQuantity(): void {
		if (this.quantity() < 99) {
			this.quantity.set(this.quantity() + 1);
		}
	}

	public decrementQuantity(): void {
		const minQuantity = this.currentQuantityInCart() > 0 ? 0 : 1;
		if (this.quantity() > minQuantity) {
			this.quantity.update(q => q - 1);
		}
	}

	public onQuantityChange(value: string): void {
		const numValue = parseInt(value, 10);
		const minQuantity = this.currentQuantityInCart() > 0 ? 0 : 1;
		if (!isNaN(numValue) && numValue >= minQuantity && numValue <= 99) {
			this.quantity.set(numValue);
		}
	}

	public onCancel(): void {
		this.dialogRef.close();
	}

	public onConfirm(): void {
		const currentQty = this.quantity();
		const originalQty = this.currentQuantityInCart();

		if (currentQty === 0) {
			this.dialogRef.close({ quantity: 0, action: 'remove' });
		} else if (originalQty === 0) {
			this.dialogRef.close({ quantity: currentQty, action: 'add' });
		} else {
			this.dialogRef.close({ quantity: currentQty, action: 'update' });
		}
	}

	private _checkCurrentQuantity(): void {
		if (this.data.currentQuantity && this.data.currentQuantity > 0) {
			this.currentQuantityInCart.set(this.data.currentQuantity);
			this.quantity.set(this.data.currentQuantity);
		}
	}
}
