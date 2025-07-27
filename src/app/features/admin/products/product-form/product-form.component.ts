import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { ProductsClientService } from '@app/clients/products/products-client.service';
import {
	CreateProductRequest,
	UpdateProductRequest,
	GetProductResponse,
	GetCategoriesResponse,
	ProductRating,
} from '@app/clients/products/product.interface';
import { GlobalStateService } from '@core/services/global-state.service';
import { UserModel } from '@app/clients/users';
import { finalize } from 'rxjs';
import { ImageFallbackDirective } from '@shared/directives/image-fallback.directive';

interface ProductFormControls {
	title: FormControl<string>;
	description: FormControl<string>;
	price: FormControl<number>;
	category: FormControl<string>;
	image: FormControl<string>;
	ratingRate: FormControl<number>;
	ratingCount: FormControl<number>;
}

interface ProductFormValue {
	title: string;
	description: string;
	price: number;
	category: string;
	image: string;
	ratingRate: number;
	ratingCount: number;
}

@Component({
	selector: 'app-product-form',
	standalone: true,
	imports: [
		CommonModule,
		ReactiveFormsModule,
		MatCardModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		MatButtonModule,
		MatIconModule,
		MatSnackBarModule,
		MatProgressSpinnerModule,
		MatToolbarModule,
		MatChipsModule,
		MatAutocompleteModule,
		ImageFallbackDirective,
	],
	templateUrl: './product-form.component.html',
	styleUrls: ['./product-form.component.scss'],
})
export class ProductFormComponent implements OnInit {
	private readonly _productsService = inject(ProductsClientService);
	private readonly _globalState = inject(GlobalStateService);
	private readonly _router = inject(Router);
	private readonly _route = inject(ActivatedRoute);
	private readonly _snackBar = inject(MatSnackBar);
	private readonly _fb = inject(FormBuilder);

	loading = signal(false);
	saving = signal(false);
	categories = signal<string[]>([]);
	isEditMode = signal(false);
	productId = signal<string | null>(null);

	productForm: FormGroup<ProductFormControls> = this._fb.group({
		title: this._fb.control('', {
			validators: [Validators.required, Validators.minLength(3), Validators.maxLength(100)],
			nonNullable: true,
		}),
		description: this._fb.control('', {
			validators: [Validators.required, Validators.minLength(10), Validators.maxLength(500)],
			nonNullable: true,
		}),
		price: this._fb.control(0, { validators: [Validators.required, Validators.min(0.01)], nonNullable: true }),
		category: this._fb.control('', { validators: [Validators.required], nonNullable: true }),
		image: this._fb.control('', {
			validators: [Validators.required, Validators.pattern(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i)],
			nonNullable: true,
		}),
		ratingRate: this._fb.control(0, { validators: [Validators.min(0), Validators.max(5)], nonNullable: true }),
		ratingCount: this._fb.control(0, { validators: [Validators.min(0)], nonNullable: true }),
	});

	ngOnInit(): void {
		this._getUser();
		this._checkRouteParams();
	}

	public get title() {
		return this.productForm.get('title');
	}
	public get description() {
		return this.productForm.get('description');
	}
	public get price() {
		return this.productForm.get('price');
	}
	public get category() {
		return this.productForm.get('category');
	}
	public get image() {
		return this.productForm.get('image');
	}
	public get ratingRate() {
		return this.productForm.get('ratingRate');
	}
	public get ratingCount() {
		return this.productForm.get('ratingCount');
	}

	public onSubmit(): void {
		if (this.productForm.valid) {
			this.saving.set(true);

			const formValue = this.productForm.getRawValue();
			const rating: ProductRating = {
				rate: Number(formValue.ratingRate) || 0,
				count: Number(formValue.ratingCount) || 0,
			};

			if (this.isEditMode()) {
				this._updateProduct(formValue, rating);
			} else {
				this._createProduct(formValue, rating);
			}
		} else {
			this._markFormGroupTouched();
			this._snackBar.open('Por favor, corrija os erros no formulário', 'Fechar', {
				duration: 3000,
				panelClass: ['error-snackbar'],
			});
		}
	}

	public isImageValid(): boolean {
		const imageControl = this.productForm.get('image');
		return !!imageControl && imageControl.valid && !!imageControl.value;
	}

	public getFormTitle(): string {
		return this.isEditMode() ? 'Editar Produto' : 'Novo Produto';
	}

	public getSubmitButtonText(): string {
		if (this.saving()) {
			return this.isEditMode() ? 'Atualizando...' : 'Criando...';
		}
		return this.isEditMode() ? 'Atualizar Produto' : 'Criar Produto';
	}

	public getFieldError(fieldName: string): string {
		const control = this.productForm.get(fieldName);
		if (!control || !control.errors) return '';

		const errors = control.errors;

		if (errors['required']) {
			const fieldLabels: Record<string, string> = {
				title: 'Nome do produto',
				description: 'Descrição',
				price: 'Preço',
				category: 'Categoria',
				image: 'URL da imagem',
			};
			return `${fieldLabels[fieldName] || fieldName} é obrigatório`;
		}

		if (errors['minlength']) {
			return `Deve ter pelo menos ${errors['minlength'].requiredLength} caracteres`;
		}

		if (errors['maxlength']) {
			return `Deve ter no máximo ${errors['maxlength'].requiredLength} caracteres`;
		}

		if (errors['min']) {
			return 'Valor deve ser maior que zero';
		}

		if (errors['max']) {
			return 'Valor deve ser no máximo 5';
		}

		if (errors['pattern']) {
			return 'URL deve ser válida e apontar para uma imagem';
		}

		return 'Campo inválido';
	}

	private _getUser(): void {
		this._globalState.populateUser$.subscribe({
			next: data => {
				if (data) {
					this._checkAdminAccess(data);
				}
			},
		});
	}

	private _checkAdminAccess(user: UserModel): void {
		if (!user || user.role !== 'Admin') {
			this._router.navigate(['/dashboard']);
			this._snackBar.open('Acesso negado. Apenas administradores podem acessar esta página.', 'Fechar', {
				duration: 5000,
				panelClass: ['error-snackbar'],
			});
		} else {
			this._loadCategories();
		}
	}

	private _checkRouteParams(): void {
		const id = this._route.snapshot.paramMap.get('id');
		if (id) {
			this.isEditMode.set(true);
			this.productId.set(id);
			this._loadProduct(id);
		}
	}

	private _loadCategories(): void {
		this._productsService.getCategories().subscribe({
			next: (response: GetCategoriesResponse) => {
				this.categories.set(response.categories);
			},
		});
	}

	private _loadProduct(id: string): void {
		this.loading.set(true);

		this._productsService
			.getProduct({ id })
			.pipe(finalize(() => this.loading.set(false)))
			.subscribe({
				next: (product: GetProductResponse) => {
					this.productForm.patchValue({
						title: product.title,
						description: product.description,
						price: product.price,
						category: product.category,
						image: product.image,
						ratingRate: product.rating.rate,
						ratingCount: product.rating.count,
					});
				},
				error: () => {
					this._snackBar.open('Erro ao carregar produto', 'Fechar', {
						duration: 3000,
						panelClass: ['error-snackbar'],
					});
					this._router.navigate(['/admin/products']);
				},
			});
	}

	private _createProduct(formValue: ProductFormValue, rating: ProductRating): void {
		const request: CreateProductRequest = {
			title: formValue.title,
			description: formValue.description,
			price: Number(formValue.price),
			category: formValue.category,
			image: formValue.image,
			rating,
		};

		this._productsService.createProduct(request).subscribe({
			next: () => {
				this._snackBar.open('Produto criado com sucesso!', 'Fechar', {
					duration: 3000,
					panelClass: ['success-snackbar'],
				});
				this._router.navigate(['/admin/products']);
			},
			error: () => {
				this._snackBar.open('Erro ao criar produto', 'Fechar', {
					duration: 3000,
					panelClass: ['error-snackbar'],
				});
				this.saving.set(false);
			},
		});
	}

	private _updateProduct(formValue: ProductFormValue, rating: ProductRating): void {
		const request: UpdateProductRequest = {
			id: this.productId()!,
			title: formValue.title,
			description: formValue.description,
			price: Number(formValue.price),
			category: formValue.category,
			image: formValue.image,
			rating,
		};

		this._productsService.updateProduct(request).subscribe({
			next: () => {
				this._snackBar.open('Produto atualizado com sucesso!', 'Fechar', {
					duration: 3000,
					panelClass: ['success-snackbar'],
				});
				this._router.navigate(['/admin/products']);
			},
			error: () => {
				this._snackBar.open('Erro ao atualizar produto', 'Fechar', {
					duration: 3000,
					panelClass: ['error-snackbar'],
				});
				this.saving.set(false);
			},
		});
	}

	private _markFormGroupTouched(): void {
		Object.keys(this.productForm.controls).forEach(key => {
			const control = this.productForm.get(key);
			control?.markAsTouched();
		});
	}
}
