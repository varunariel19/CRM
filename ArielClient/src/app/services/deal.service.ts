import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateDealPayload, Deal, UpdateDealPayload, UpdateDealStagePayload } from '../core/types/deal.type';
import { endpoints } from '../core/constants/endpoints';

@Injectable({
    providedIn: 'root'
})
export class DealService {

    constructor(private http: HttpClient) { }

    getAllDeals(): Observable<Deal[]> {
        return this.http.get<Deal[]>(endpoints.getDeals);
    }

    createDeal(payload: CreateDealPayload): Observable<Deal> {
        return this.http.post<Deal>(endpoints.createDeal, payload);
    }

    updateDeal(id: string, payload: Partial<Deal>): Observable<Deal> {
        return this.http.put<Deal>(endpoints.updateDeal(id), payload , {withCredentials : true});
    }

    updateDealStage(id: string, payload: UpdateDealStagePayload): Observable<void> {
        return this.http.patch<void>(endpoints.updateDealStage(id), payload , {withCredentials : true});
    }
}