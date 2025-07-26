export interface AuthenticateUserRequest {
	email: string;
	password: string;
}

export interface AuthenticateUserResponse {
	token: string;
	email: string;
	name: string;
	role: string;
	id: string;
	phone?: string;
}
