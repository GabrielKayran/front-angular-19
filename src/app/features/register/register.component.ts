import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { CustomValidators } from '@shared/validators';

interface RegisterFormControls {
	username: FormControl<string>;
	email: FormControl<string>;
	phone: FormControl<string>;
	password: FormControl<string>;
}

@Component({
	selector: 'app-register',
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
	templateUrl: './register.component.html',
	styleUrl: './register.component.scss',
})
export class RegisterComponent {
	private _fb = inject(FormBuilder);
	private _usersClient = inject(UsersClientService);
	private _router = inject(Router);
	private _snackBar = inject(MatSnackBar);

	isLoading = signal(false);
	hidePassword = signal(true);

	form: FormGroup<RegisterFormControls> = this._fb.group({
		username: this._fb.control('', {
			validators: [Validators.required, Validators.minLength(3), Validators.maxLength(50)],
			nonNullable: true,
		}),
		email: this._fb.control('', {
			validators: [CustomValidators.email()],
			nonNullable: true,
		}),
		phone: this._fb.control('', {
			validators: [CustomValidators.phone()],
			nonNullable: true,
		}),
		password: this._fb.control('', {
			validators: [CustomValidators.password()],
			nonNullable: true,
		}),
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
		if (field.errors['minlength']) {
			const minLength = field.errors['minlength'].requiredLength;
			return `${this.getFieldLabel(fieldName)} deve ter pelo menos ${minLength} caracteres`;
		}
		if (field.errors['maxlength']) {
			const maxLength = field.errors['maxlength'].requiredLength;
			return `${this.getFieldLabel(fieldName)} deve ter no máximo ${maxLength} caracteres`;
		}

		if (field.errors['maxLength']) return field.errors['maxLength'];
		if (field.errors['invalidEmail']) return field.errors['invalidEmail'];

		if (field.errors['minLength']) return field.errors['minLength'];
		if (field.errors['uppercase']) return field.errors['uppercase'];
		if (field.errors['lowercase']) return field.errors['lowercase'];
		if (field.errors['number']) return field.errors['number'];
		if (field.errors['specialChar']) return field.errors['specialChar'];

		if (field.errors['invalidPhone']) return field.errors['invalidPhone'];

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
			phone: formValue.phone.replace(/\D/g, ''),
			password: formValue.password,
		};

		this._usersClient
			.createUser(request, true)
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
					}, 500);
				},
			});
	}
}
