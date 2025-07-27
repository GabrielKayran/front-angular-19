import { Injectable, inject, signal } from '@angular/core';
import { finalize, Observable, of, forkJoin } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { CartClientService } from '@app/clients/cart/cart-client.service';
import { GlobalStateService } from '@core/services/global-state.service';
import { CreateCartRequest, GetCartResponse, CartProduct } from '@app/clients/cart/cart.interface';
import { ProductsClientService } from '@app/clients/products/products-client.service';
import { GetProductResponse } from '@app/clients/products/product.interface';

export interface CartProductWithDetails extends CartProduct {
	product: GetProductResponse;
}

@Injectable({
	providedIn: 'root',
})
export class CartService {
	private _cartClient = inject(CartClientService);
	private _globalState = inject(GlobalStateService);
	private _productsClient = inject(ProductsClientService);

	private _currentCart = signal<GetCartResponse | null>(null);
	private _cartItems = signal<CartProduct[]>([]);
	private _cartCount = signal(0);
	private _isLoading = signal(false);

	private _productsCache = new Map<string, GetProductResponse>();

	public readonly currentCart = this._currentCart.asReadonly();
	public readonly cartItems = this._cartItems.asReadonly();
	public readonly cartCount = this._cartCount.asReadonly();
	public readonly isLoading = this._isLoading.asReadonly();

	constructor() {
		this.initializeCart().subscribe();
	}

	private _resetCartState(): void {
		this._currentCart.set(null);
		this._cartItems.set([]);
		this._cartCount.set(0);
		this._productsCache.clear();
	}

	public initializeCart(): Observable<void> {
		const user = this._globalState.user();
		if (!user) return of();

		this._isLoading.set(true);
		return this.checkExistingCart().pipe(
			finalize(() => this._isLoading.set(false)),
			tap(cart => this._setCart(cart)),
			catchError(() => of(null)),
			map(() => void 0)
		);
	}

	public checkExistingCart(): Observable<GetCartResponse | null> {
		const user = this._globalState.user();
		if (!user) return of(null);

		return this._cartClient.getMyCart(true).pipe(
			map(cart => cart || null),
			catchError(() => of(null))
		);
	}

	public addToCart(productId: string, quantity: number): Observable<void> {
		const user = this._globalState.user();
		if (!user) throw new Error('Usuário não autenticado');

		this._isLoading.set(true);

		const cart = this._currentCart();
		if (!cart) {
			return this._createCart(user.id, productId, quantity);
		}
		return this._updateCartWithProduct(cart, productId, quantity);
	}

	private _createCart(userId: string, productId: string, quantity: number): Observable<void> {
		const createRequest: CreateCartRequest = {
			userId,
			date: new Date().toISOString(),
			products: [{ productId, quantity }],
		};
		return this._cartClient.createCart(createRequest, true).pipe(
			finalize(() => this._isLoading.set(false)),
			tap(cart => this._setCart(cart)),
			catchError(error => {
				throw error;
			}),
			map(() => void 0)
		);
	}

	private _updateCartWithProduct(cart: GetCartResponse, productId: string, quantity: number): Observable<void> {
		const products = Array.isArray(cart.products) ? [...cart.products] : [];
		const idx = products.findIndex(p => p.productId === productId);

		if (idx >= 0) {
			products[idx].quantity += quantity;
		} else {
			products.push({ productId, quantity });
		}

		return this._updateCart(cart, products);
	}

	public updateProductQuantity(productId: string, newQuantity: number): Observable<void> {
		const cart = this._currentCart();
		if (!cart) return of();

		this._isLoading.set(true);

		if (newQuantity <= 0) {
			return this.clearCart();
		}

		const products = Array.isArray(cart.products) ? [...cart.products] : [];
		const idx = products.findIndex(p => p.productId === productId);

		if (idx >= 0) {
			products[idx].quantity = newQuantity;
		}

		return this._updateCart(cart, products);
	}

	private _updateCart(cart: GetCartResponse, products: CartProduct[]): Observable<void> {
		const updateRequest: CreateCartRequest = {
			userId: cart.userId,
			date: cart.date,
			products,
			cartId: cart.id,
		};

		return this._cartClient.updateCart(updateRequest, true).pipe(
			finalize(() => this._isLoading.set(false)),
			tap(updatedCart => this._setCart(updatedCart)),
			catchError(error => {
				throw error;
			}),
			map(() => void 0)
		);
	}

	public removeFromCart(productId: string): Observable<void> {
		return this.updateProductQuantity(productId, 0);
	}

	public clearCart(): Observable<void> {
		const cart = this._currentCart();
		if (!cart) return of();

		this._isLoading.set(true);

		return this._cartClient.deleteCart(cart.id).pipe(
			finalize(() => this._isLoading.set(false)),
			tap(() => this._resetCartState()),
			catchError(error => {
				throw error;
			}),
			map(() => void 0)
		);
	}

	public getProductQuantity(productId: string): number {
		const items = this._cartItems();
		const product = items?.find(p => p.productId === productId);
		return product?.quantity || 0;
	}

	private _setCart(cart: GetCartResponse | null): void {
		if (cart) {
			this._currentCart.set(cart);
			this._cartItems.set(cart.products);
			this._updateCartCount();
		} else {
			this._resetCartState();
		}
	}

	private _updateCartCount(): void {
		const items = this._cartItems();
		const totalCount = items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
		this._cartCount.set(totalCount);
	}

	public isProductInCart(productId: string): boolean {
		return this.getProductQuantity(productId) > 0;
	}

	public getCartItemsWithDetails(): Observable<CartProductWithDetails[]> {
		const cartItems = this._cartItems();
		if (!cartItems?.length) return of([]);

		const itemsWithDetails: CartProductWithDetails[] = [];
		const itemsToFetch: CartProduct[] = [];

		cartItems.forEach(item => {
			const cachedProduct = this._productsCache.get(item.productId);
			if (cachedProduct) {
				itemsWithDetails.push({ ...item, product: cachedProduct });
			} else {
				itemsToFetch.push(item);
			}
		});

		if (!itemsToFetch.length) return of(itemsWithDetails);

		const productRequests = itemsToFetch.map(item =>
			this._productsClient.getProduct({ id: item.productId }).pipe(
				map(product => {
					this._productsCache.set(item.productId, product);
					return { ...item, product } as CartProductWithDetails;
				}),
				catchError(() => of(null))
			)
		);

		return forkJoin(productRequests).pipe(
			map(results => [...itemsWithDetails, ...(results.filter(Boolean) as CartProductWithDetails[])])
		);
	}
}
