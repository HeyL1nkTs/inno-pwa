import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { JwtService } from '../generalServices/jwt.service';
import _ from 'lodash';

export const authGuard: CanActivateFn = (route, state) => {

    const router = inject(Router);
    const user = inject(JwtService);

    if (user.isAuthenticated()) {
        const role = user.checkRoleInToken();
        if (_.isEqual(role, 'admin')) {
            router.navigate(['admin']);
        } else if (_.isEqual(role, 'seller')) {
            router.navigate(['client']);
        }
        return false;
    }
    return true;
};
