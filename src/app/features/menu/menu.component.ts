import { Component, input, output } from '@angular/core';
import { MatFabButton, MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';

@Component({
	selector: 'app-menu',
	imports: [MatIcon, MatIconButton, MatTooltip, MatFabButton],
	templateUrl: './menu.component.html',
	styleUrl: './menu.component.scss',
})
export class MenuComponent {
	menuToggleEvent = output();
	logoutEvent = output();

	isCollapsed = input<boolean | undefined>(false);

	public get tooltipText(): string {
		return this.isCollapsed() ? 'Abrir Menu' : 'Fechar Menu';
	}

	public emitMenuToggle(event: MouseEvent): void {
		event.stopPropagation();
		this.menuToggleEvent.emit();
	}
}
