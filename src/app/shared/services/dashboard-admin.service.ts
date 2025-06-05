import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, map, Observable, of, tap } from 'rxjs';

import { CompanyService } from './company.service';
import { FeatureService } from './feature.service';
import { UserService } from './user.service';
import { project } from './mock-api/data';
import { environment } from 'environments/environment';

@Injectable({providedIn: 'root'})
export class dashboardAdminService
{
    private _data: BehaviorSubject<any> = new BehaviorSubject(null);
endpoint = `${environment.api}/dashboard-admin`;
    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient,
        private _companyService: CompanyService,
        private _featureService: FeatureService,
        private _userService:UserService)
    {

    }

    
      getStatsOverview(): Observable<any> {
        return this._httpClient.get(`${this.endpoint}/overviewStats`);
      }


    //mock api get data
    getData(): Observable<any> {
        return of (project);
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

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get data
     */
    // getData(): Observable<any>
    // {
    //     return this._httpClient.get('api/dashboards/project').pipe(
    //         tap((response: any) =>
    //         {
    //             this._data.next(response);
    //         }),
    //     );
    // }

    
}
