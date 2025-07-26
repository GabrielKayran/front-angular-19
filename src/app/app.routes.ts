import { Routes } from '@angular/router';

export const routes: Routes = [
	// Rota vazia redireciona para login
	{ path: '', redirectTo: '/login', pathMatch: 'full' },
	
	// Rota para login
	{
		path: 'login',
		loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent)
	},
	
	// Rota para cadastro
	{
		path: 'cadastro',
		loadComponent: () => import('./features/cadastro/cadastro.component').then(m => m.CadastroComponent)
	},
	
	// Rota para dashboard
	{
		path: 'dashboard',
		loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
	},
	
	// Rota wildcard para redirecionamento
	{ path: '**', redirectTo: '/login' }
];
