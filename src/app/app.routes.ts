import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { clientGuard } from './guards/client.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
    {path: '', redirectTo: 'auth', pathMatch: 'full'},
    {path: 'admin' , loadChildren: () => import('./admin/admin.routes').then(r => r.routes), canActivate: [adminGuard]},
    {path: 'client' , loadChildren: () => import('./client/client.routes').then(r => r.routes), canActivate: [clientGuard]},
    {path: 'auth' , loadChildren: () => import('./auth/auth.routes').then(r => r.routes), canActivate: [authGuard]},
];
