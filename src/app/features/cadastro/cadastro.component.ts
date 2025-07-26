import { Component, inject, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';

import { UsersClientService } from '@app/clients/users/users-client.service';
import { CreateUserRequest } from '@app/clients/users/user.interface';
import { NgxMaskDirective } from 'ngx-mask';

interface CadastroFormControls {
	username: FormControl<string>;
	email: FormControl<string>;
	phone: FormControl<string>;
	password: FormControl<string>;
}

@Component({
	selector: 'app-cadastro',
	imports: [
		CommonModule,
		RouterModule,
		ReactiveFormsModule,
		MatCardModule,
		MatFormFieldModule,
		MatInputModule,
		MatButtonModule,
		MatIconModule,
		MatProgressSpinnerModule,
		NgxMaskDirective,
	],
	templateUrl: './cadastro.component.html',
	styleUrl: './cadastro.component.scss',
})
export class CadastroComponent {
	private _fb = inject(FormBuilder);
	private _usersClient = inject(UsersClientService);
	private _router = inject(Router);
	private _snackBar = inject(MatSnackBar);

	isLoading = signal(false);
	hidePassword = signal(true);

	form: FormGroup<CadastroFormControls> = this._fb.group({
		username: this._fb.control('', { validators: [Validators.required, Validators.minLength(3)], nonNullable: true }),
		email: this._fb.control('', { validators: [Validators.required, Validators.email], nonNullable: true }),
		phone: this._fb.control('', {
			validators: [Validators.required, Validators.pattern(/^\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}$/)],
			nonNullable: true,
		}),
		password: this._fb.control('', { validators: [Validators.required, Validators.minLength(6)], nonNullable: true }),
	});

	public togglePasswordVisibility(): void {
		this.hidePassword.set(!this.hidePassword());
	}

	public hasFieldError(fieldName: string): boolean {
		const field = this.form.get(fieldName);
		return !!(field && field.invalid && field.touched);
	}

	public getFieldError(fieldName: string): string {
		const field = this.form.get(fieldName);
		if (!field || !field.errors) return '';

		if (field.errors['required']) return `${this.getFieldLabel(fieldName)} é obrigatório`;
		if (field.errors['email']) return 'E-mail inválido';
		if (field.errors['minlength']) {
			const minLength = field.errors['minlength'].requiredLength;
			return `${this.getFieldLabel(fieldName)} deve ter pelo menos ${minLength} caracteres`;
		}
		if (field.errors['pattern']) return 'Formato de telefone inválido';

		return 'Campo inválido';
	}

	private getFieldLabel(fieldName: string): string {
		const labels: Record<string, string> = {
			username: 'Nome de usuário',
			email: 'E-mail',
			phone: 'Telefone',
			password: 'Senha',
		};
		return labels[fieldName] || fieldName;
	}

	public onSubmit(): void {
		if (this.form.invalid) {
			this.form.markAllAsTouched();
			return;
		}

		this.isLoading.set(true);

		const formValue = this.form.getRawValue();
		const request: CreateUserRequest = {
			username: formValue.username,
			email: formValue.email,
			phone: formValue.phone,
			password: formValue.password,
		};

		this._usersClient
			.createUser(request)
			.pipe(finalize(() => this.isLoading.set(false)))
			.subscribe({
				next: () => {
					this._snackBar.open('Cadastro realizado com sucesso!', 'Fechar', {
						duration: 5000,
						horizontalPosition: 'center',
						verticalPosition: 'top',
					});
					setTimeout(() => {
						this._router.navigate(['/login']);
					}, 1500);
				},
			});
	}
}
