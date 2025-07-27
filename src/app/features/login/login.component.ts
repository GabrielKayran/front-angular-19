import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { AuthClientService } from '@app/clients/auth/auth-client.service';
import { GlobalStateService } from '@core/services/global-state.service';
import { AuthenticateUserRequest } from '@app/clients/auth/auth.interface';
import { finalize } from 'rxjs';

interface LoginFormControls {
	email: FormControl<string>;
	password: FormControl<string>;
}

@Component({
	selector: 'app-login',
	imports: [
		CommonModule,
		ReactiveFormsModule,
		MatCardModule,
		MatFormFieldModule,
		MatInputModule,
		MatButtonModule,
		MatIconModule,
		MatProgressSpinnerModule,
		RouterLink,
	],
	templateUrl: './login.component.html',
	styleUrl: './login.component.scss',
})
export class LoginComponent {
	private _fb = inject(FormBuilder);
	private _router = inject(Router);
	private _authClient = inject(AuthClientService);
	private _globalState = inject(GlobalStateService);

	isLoading = signal(false);
	hidePassword = signal(true);

	loginForm: FormGroup<LoginFormControls> = this._fb.group({
		email: this._fb.control('', { validators: [Validators.required, Validators.email], nonNullable: true }),
		password: this._fb.control('', { validators: [Validators.required, Validators.minLength(6)], nonNullable: true }),
	});

	public togglePasswordVisibility(): void {
		this.hidePassword.set(!this.hidePassword());
	}

	public getFieldError(fieldName: string): string {
		const field = this.loginForm.get(fieldName);
		if (field?.hasError('required')) {
			return `${fieldName === 'email' ? 'E-mail' : 'Senha'} é obrigatório`;
		}
		if (field?.hasError('email')) {
			return 'E-mail deve ter um formato válido';
		}
		if (field?.hasError('minlength')) {
			return 'Senha deve ter pelo menos 6 caracteres';
		}
		return '';
	}

	public hasFieldError(fieldName: string): boolean {
		const field = this.loginForm.get(fieldName);
		return !!(field?.invalid && (field?.dirty || field?.touched));
	}

	public onSubmit(): void {
		if (this.loginForm.invalid) {
			this.loginForm.markAllAsTouched();
			return;
		}

		this.isLoading.set(true);
		const request: AuthenticateUserRequest = this.loginForm.getRawValue();

		this._authClient
			.login(request, true)
			.pipe(finalize(() => this.isLoading.set(false)))
			.subscribe({
				next: response => {
					this._globalState.setToken(response.token);
					const route = response.role === 'Admin' ? '/admin/products' : '/products';
					this._router.navigate([route]);
				},
			});
	}
}
