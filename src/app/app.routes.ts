import { Routes } from '@angular/router';

export const routes: Routes = [
    {path: '', redirectTo: 'auth', pathMatch: 'full'},
    {path: 'admin' , loadChildren: () => import('./admin/admin.routes').then(r => r.routes)},
    {path: 'client' , loadChildren: () => import('./client/client.routes').then(r => r.routes)},
    {path: 'auth' , loadChildren: () => import('./auth/auth.routes').then(r => r.routes)},
];
