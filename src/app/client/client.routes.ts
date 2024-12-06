import { Routes } from '@angular/router';
import { ClientComponent } from './client.component';
import { SalePointComponent } from './ws/sale-point/sale-point.component';
import { ProfileComponent } from '../admin/ws/profile/profile.component';

export const routes: Routes = [
    {path: '' , component: ClientComponent, children: [
        {path: '', redirectTo: 'catalog', pathMatch: 'prefix'},
        {path: 'profile', component: ProfileComponent},
        {path: 'catalog', component: SalePointComponent},
    ]},
];