import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { project } from './mock-api/data';
import { environment } from 'environments/environment';

@Injectable({providedIn: 'root'})
export class dashboardVetService
{
    endpoint = `${environment.api}/dashboard-veterinary`;
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
      `${this.endpoint}/most-sold-categories/${companyId}`
    );
  }

    getAppointmentStats(companyId: string): Observable<any> {
  return this._httpClient.get(`${this.endpoint}/appointmentStat?companyId=${companyId}`);
}

getOverviewStats(): Observable<any> {
  return this._httpClient.get(`${this.endpoint}/overviewStats`);
}

getPetCountBySpecies(): Observable<any> {
  return this._httpClient.get(`${this.endpoint}/pet-count-by-species`);
}

getAppointmentsPerDay(month: string): Observable<any> {
  const params = new HttpParams().set('month', month);
  return this._httpClient.get<any>(`${this.endpoint}/appointment-per-day`, { params });
}

getCompanyTeam(): Observable<any> {
  return this._httpClient.get(`${this.endpoint}/team`);
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
