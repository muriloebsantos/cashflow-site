import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Entry } from "../models/entry";
import { HttpService } from "./@base/http.service";

@Injectable()
export class EntryService extends HttpService {
    
    constructor(protected http: HttpClient) {
        super(http);
    }

    public getEntries(initialDate:Date, endDate:Date): Observable<Entry[]> {
        return this.getAuthenticated<Entry[]>(`/entries?initDate=${initialDate.toISOString()}&endDate=${endDate.toISOString()}`)
    }

    public getPendingEntries(month: number, year: number, includeOverdue: number): Observable<Entry[]> {
        return this.getAuthenticated<Entry[]>(`/entries/pending?month=${month}&year=${year}&includeOverdue=${includeOverdue}`);
    }

    public saveEntry(entry): Observable<any[]> {
        return this.postAuthenticated<Entry[]>('/entries', entry);
    }

    public updateEntry(id: string, entry, updateAll: number): Observable<any[]> {
        return this.putAuthenticated<Entry[]>(`/entries/${id}?updateAll=${updateAll}`, entry);
    }

    public commitEntry(ids: string[]): Observable<any[]> {
        return this.postAuthenticated<Entry[]>(`/entries/commit`, ids);
    }

    public delete(id: string, deleteAll: number): Observable<any[]> {
        return this.deleteAuthenticated<Entry[]>(`/entries/${id}?deleteAll=${deleteAll}`);
    }
}