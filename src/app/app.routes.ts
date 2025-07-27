import { Routes } from '@angular/router';

export const routes: Routes = [
	{ path: '', redirectTo: '/login', pathMatch: 'full' },

	{
		path: 'login',
		loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent),
	},

	{
		path: 'register',
		loadComponent: () => import('@app/features/register/register.component').then(m => m.RegisterComponent),
	},

	{
		path: 'admin/products',
		loadComponent: () =>
			import('@app/features/products-list/products-list.component').then(m => m.ProductsListComponent),
	},
	{
		path: 'admin/products/create',
		loadComponent: () =>
			import('./features/admin/products/product-form/product-form.component').then(m => m.ProductFormComponent),
	},
	{
		path: 'admin/products/edit/:id',
		loadComponent: () =>
			import('./features/admin/products/product-form/product-form.component').then(m => m.ProductFormComponent),
	},
	{
		path: 'products',
		loadComponent: () =>
			import('@app/features/products-list/products-list.component').then(m => m.ProductsListComponent),
	},
	{
		path: 'cart',
		loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent),
	},
	{
		path: 'my-orders',
		loadComponent: () => import('./features/my-orders/my-orders.component').then(m => m.MyOrdersComponent),
	},
	{
		path: 'admin/sales',
		loadComponent: () => import('./features/admin/sales/sales-management.component').then(m => m.SalesManagementComponent),
	},

	{ path: '**', redirectTo: '/login' },
];
