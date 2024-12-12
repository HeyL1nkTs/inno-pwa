import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import _ from "lodash";
import { JwtService } from "../generalServices/jwt.service";

export const clientGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);
    const user = inject(JwtService);

    if (user.isAuthenticated()) {
        if(_.isEqual(user.checkRoleInToken(), 'seller')){
            return true;
        } else if (_.isEqual(user.checkRoleInToken(), 'admin')) {
            router.navigate(['admin']);
            return false;
        }
    }

    router.navigate(['auth']);
    return false;
};