import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import _ from "lodash";
import { JwtService } from "../generalServices/jwt.service";

export const adminGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const user = inject(JwtService);

    if (user.isAuthenticated()) {
        console.log('authenticated')
        if(_.isEqual(user.checkRoleInToken(), 'admin')){
            return true;
        } else if (_.isEqual(user.checkRoleInToken(), 'seller')) {
            router.navigate(['client']);
            return false;
        }
    }

    router.navigate(['auth']);
    return false;
};