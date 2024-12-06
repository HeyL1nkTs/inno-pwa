import { Routes } from "@angular/router";
import { AuthComponent } from "./auth.component";
import { LogoutComponent } from "./ws/logout/logout.component";
import { LoginComponent } from "./ws/login/login.component";

export const routes: Routes =[
    {path: '', component: AuthComponent, children:[
        {path: '', redirectTo: 'login', pathMatch: 'prefix'},
        {path: 'login', component: LoginComponent},
        {path: 'logout', component: LogoutComponent}
    ]}
]