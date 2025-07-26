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

export interface LoggedUser {
	id?: string;
	email: string;
	name: string;
	role: string;
	token: string;
	isAuthenticated: boolean;
}

export interface JwtPayload {
	sub: string; // user id
	email: string;
	name: string;
	role: string;
	exp: number;
	iat: number;
}
