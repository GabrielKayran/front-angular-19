import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SaleResponseDto } from '@app/clients/sales/sale.interface';

@Component({
	selector: 'app-sale-card',
	standalone: true,
	imports: [
		CommonModule,
		MatCardModule,
		MatButtonModule,
		MatIconModule,
		MatChipsModule,
		MatDividerModule,
		MatTooltipModule,
	],
	templateUrl: './sale-card.component.html',
	styleUrls: ['./sale-card.component.scss'],
})
export class SaleCardComponent {
	sale = input.required<SaleResponseDto>();
	showActions = input(false);
	isAdminMode = input(false);

	cancelSale = output<SaleResponseDto>();
	viewDetails = output<SaleResponseDto>();

	public formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('pt-BR', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
		});
	}

	public formatCurrency(value: number): string {
		return new Intl.NumberFormat('pt-BR', {
			style: 'currency',
			currency: 'BRL',
		}).format(value);
	}

	public getStatusText(status: string): string {
		switch (status?.toLowerCase()) {
			case 'active':
				return 'Ativo';
			case 'cancelled':
				return 'Cancelado';
			default:
				return 'Ativo';
		}
	}

	public canCancelSale(status: string): boolean {
		return status?.toLowerCase() === 'active';
	}

	public onCancelSale(): void {
		this.cancelSale.emit(this.sale());
	}
}
