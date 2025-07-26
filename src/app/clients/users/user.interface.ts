import { UserRole, EntityStatus, PaginationParams } from '@shared/interfaces';

export interface Geolocation {
	lat: string;
	long: string;
}

export interface Address {
	city: string;
	street: string;
	number: number;
	zipcode: string;
	geolocation: Geolocation;
}

export interface UserName {
	firstname: string;
	lastname: string;
}

export interface CreateUserRequest {
	email: string;
	username: string;
	password: string;
	name?: UserName;
	address?: Address;
	status?: EntityStatus;
	role?: UserRole;
	phone: string;
}

export interface UserModel {
	id: string;
	email?: string;
	username: string;
	name?: UserName;
	address?: Address;
	phone?: string;
	status?: EntityStatus;
	role: UserRole;
	createdAt?: string;
	updatedAt?: string;
}

export interface GetUserRequest {
	id: string;
}

export interface GetUserResponse {
	id: string;
	email: string;
	username: string;
	password: string;
	name: UserName;
	address: Address;
	phone: string;
	status: EntityStatus;
	role: UserRole;
}

export interface GetUsersRequest extends PaginationParams {
	email?: string;
	username?: string;
	status?: EntityStatus;
	role?: UserRole;
}

export interface GetUsersUserDto {
	id: string;
	email: string;
	username: string;
	password: string;
	name: UserName;
	address: Address;
	phone: string;
	status: EntityStatus;
	role: UserRole;
}

export interface GetUsersResponse {
	data: GetUsersUserDto[];
	totalItems: number;
	currentPage: number;
	totalPages: number;
}

export interface UpdateUserRequest {
	id: string;
	email?: string;
	username?: string;
	password?: string;
	name?: Partial<UserName>;
	address?: Partial<Address>;
	phone?: string;
	status?: EntityStatus;
	role?: UserRole;
}

export interface UpdateUserResponse {
	id: string;
	email: string;
	username: string;
	name: UserName;
	address: Address;
	phone: string;
	status: EntityStatus;
	role: UserRole;
	updatedAt: string;
}

export interface DeleteUserRequest {
	id: string;
}
