import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { project } from './mock-api/data';
import { environment } from 'environments/environment';

@Injectable({providedIn: 'root'})
export class dashboardVetService
{
    endpoint = `${environment.api}`;
    private _data: BehaviorSubject<any> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for data
     */
    get data$(): Observable<any>
    {
        return this._data.asObservable();
    }

    getMostSoldCategories(companyId: string): Observable<{ _id: string, totalQuantity: number }[]> {
    return this._httpClient.get<{ _id: string, totalQuantity: number }[]>(
      `${this.endpoint}/cart/most-sold-categories/${companyId}`
    );
  }

    getDashboardStats(companyId: string): Observable<any> {
  return this._httpClient.get(`${this.endpoint}/appointments/dashboard-stats-vet?companyId=${companyId}`);
}

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get data
     */
    getData(): Observable<any> {
            return new BehaviorSubject(project).asObservable();
        }


}
