import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";

export class HttpService {
    
    protected baseUrl: string;

    constructor(protected httpClient: HttpClient) {
        this.baseUrl = environment.api;
    }

    protected getAuthenticated<T>(path: string) : Observable<T> {
        this.updateUserActivity();
        return this.httpClient.get<T>(
            environment.api + path, this.getAuthOptions()
        );
    }

    protected postAuthenticated<T>(path: string, body: any) : Observable<T> {
        this.updateUserActivity();
        return this.httpClient.post<T>(
            environment.api + path, body, this.getAuthOptions()
        );
    }

    protected post<T>(path: string, body: any) : Observable<T> {
        return this.httpClient.post<T>(
            environment.api + path, body
        );
    }

    protected putAuthenticated<T>(path: string, body: any) : Observable<T> {
        this.updateUserActivity();
        return this.httpClient.put<T>(
            environment.api + path, body, this.getAuthOptions()
        );
    }

    protected deleteAuthenticated<T>(path: string) : Observable<T> {
        this.updateUserActivity();
        return this.httpClient.delete<T>(
            environment.api + path, this.getAuthOptions()
        );
    }

    private updateUserActivity() {
        this.httpClient.post(
            environment.api + "/me/activity", null, this.getAuthOptions()
        ).subscribe();
    }

    private getAuthOptions () {
        return {  
            headers: {
            'Authorization': localStorage.getItem('cashflow_token')
            }
        }
    }
}