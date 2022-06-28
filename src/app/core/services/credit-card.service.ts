import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { CreditCard } from "../models/credit-card";
import { HttpService } from "./@base/http.service";

@Injectable()
export class CreditCardService extends HttpService {
    
    constructor(protected http: HttpClient) {
        super(http);
    }

    public getCreditCards(): Observable<CreditCard[]> {
        return this.getAuthenticated<CreditCard[]>('/credit-cards');
    }
}