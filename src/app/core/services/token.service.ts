import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { CreateTokenResponse } from "../models/create-token-response";

@Injectable()
export class TokenService {
    constructor(private http: HttpClient) {

    }

    createToken(email: string, password: string): Observable<CreateTokenResponse> {
        return this.http.post<CreateTokenResponse>(environment.api + '/token', { email, password });
    }
}