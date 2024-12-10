import { Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { DashboardComponent } from './ws/dashboard/dashboard.component';
import { CatalogSelectorComponent } from './ws/catalog-selector/catalog-selector.component';
import { ProfileComponent } from './ws/profile/profile.component';
import { QueueComponent } from './ws/queue/queue.component';
import { ExtrasComponent } from './ws/extras/extras.component';
import { UsersComponent } from './ws/users/users.component';

export const routes: Routes = [
    {
        path: '', component: AdminComponent, children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'prefix' },
            { path: 'dashboard', component: DashboardComponent },
            { path: 'catalog/:selector', component: CatalogSelectorComponent },
            { path: 'profile', component: ProfileComponent },
            { path: 'request', component: QueueComponent },
            { path: 'extras', component: ExtrasComponent },
            { path: 'users', component: UsersComponent },
        ]
    },
];