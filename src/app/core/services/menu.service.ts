import { Injectable, signal } from '@angular/core';

@Injectable({
	providedIn: 'root',
})
export class MenuService {
	private _isMenuOpen = signal(false);

	public readonly isMenuOpen = this._isMenuOpen.asReadonly();

	/**
	 * Abre o menu lateral
	 */
	public openMenu(): void {
		this._isMenuOpen.set(true);
	}

	/**
	 * Fecha o menu lateral
	 */
	public closeMenu(): void {
		this._isMenuOpen.set(false);
	}

	/**
	 * Alterna o estado do menu lateral
	 */
	public toggleMenu(): void {
		this._isMenuOpen.update(current => !current);
	}

	/**
	 * Define o estado do menu lateral
	 */
	public setMenuState(isOpen: boolean): void {
		this._isMenuOpen.set(isOpen);
	}
}
