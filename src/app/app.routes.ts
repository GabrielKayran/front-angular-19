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
		path: 'dashboard',
		loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
	},

	// Admin Routes - Products CRUD
	{
		path: 'admin/products',
		loadComponent: () => import('./features/admin/products/products-list/products-list.component').then(m => m.ProductsListComponent),
	},
	{
		path: 'admin/products/create',
		loadComponent: () => import('./features/admin/products/product-form/product-form.component').then(m => m.ProductFormComponent),
	},
	{
		path: 'admin/products/edit/:id',
		loadComponent: () => import('./features/admin/products/product-form/product-form.component').then(m => m.ProductFormComponent),
	},

	// Customer Routes - Products View (TODO: implementar)
	// {
	// 	path: 'products',
	// 	loadComponent: () => import('./features/products/products-view/products-view.component').then(m => m.ProductsViewComponent),
	// },
	// {
	// 	path: 'cart',
	// 	loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent),
	// },

	{ path: '**', redirectTo: '/login' },
];
