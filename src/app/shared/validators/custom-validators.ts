import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
	static email(): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			const value = control.value;
			if (!value) {
				return { required: true };
			}
			if (value.length > 100) {
				return { maxLength: 'O endereço de email não pode ter mais de 100 caracteres.' };
			}
			const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
			if (!emailRegex.test(value)) {
				return { invalidEmail: 'O endereço de email fornecido não é válido.' };
			}
			return null;
		};
	}

	static password(): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			const value = control.value;
			if (!value) {
				return { required: true };
			}
			if (value.length < 8) {
				return { minLength: 'A senha deve ter pelo menos 8 caracteres.' };
			}
			if (!/[A-Z]+/.test(value)) {
				return { uppercase: 'A senha deve conter pelo menos uma letra maiúscula.' };
			}
			if (!/[a-z]+/.test(value)) {
				return { lowercase: 'A senha deve conter pelo menos uma letra minúscula.' };
			}
			if (!/[0-9]+/.test(value)) {
				return { number: 'A senha deve conter pelo menos um número.' };
			}
			if (!/[!?*.@#$%^&+=]+/.test(value)) {
				return { specialChar: 'A senha deve conter pelo menos um caractere especial.' };
			}
			return null;
		};
	}

	static phone(): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			const value = control.value;
			if (!value) {
				return { required: true };
			}
			const phoneRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
			if (!phoneRegex.test(value)) {
				return { invalidPhone: 'O telefone deve estar no formato brasileiro, ex: (11) 91234-5678 ou 11912345678' };
			}
			return null;
		};
	}
}
