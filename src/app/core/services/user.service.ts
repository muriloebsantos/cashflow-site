import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { User } from "../models/user";
import { HttpService } from "./@base/http.service";
import jwt_decode from "jwt-decode";
@Injectable()
export class UserService extends HttpService {
    
    constructor(protected http: HttpClient) {
        super(http);
    }

    public getUser(): Observable<User> {
        return this.getAuthenticated<User>('/me');
    }

    public getAllUsers():Observable<User[]> {
        return this.getAuthenticated<User[]>('/users');
    }

    public updateBalance(newBalance: number, newSavings: number, createEntry: boolean): Observable<any> {
        return this.postAuthenticated<User>('/me/balance-adjustment', { newBalance, newSavings, createEntry });
    }

    public createUser(userData:object):Observable<any> {
        return this.post<any>('/users', userData);
    }

    public isAdmin(){
        const userToken:any = jwt_decode(localStorage.getItem('cashflow_token'));
        return userToken.isAdmin;
    }
}