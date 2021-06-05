import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";

@Injectable()
export class AuthGuardService implements CanActivate {

    constructor(private router: Router) {

    }

    canActivate() {
        const token = localStorage.getItem("cashflow_token");

        if(!token) {
            this.router.navigate(['login']);
            return false;
        }

        // const expiration = localStorage.getItem("exp");

        // if(!expiration) {
        //     return false;
        // }

        return true;
    }
}