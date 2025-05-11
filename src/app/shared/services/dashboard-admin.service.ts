import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, map, Observable, tap } from 'rxjs';

import { CompanyService } from './company.service';
import { FeatureService } from './feature.service';
import { UserService } from './user.service';
import { project } from './mock-api/data';

@Injectable({providedIn: 'root'})
export class dashboardAdminService
{
    private _data: BehaviorSubject<any> = new BehaviorSubject(null);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient,
        private _companyService: CompanyService,
        private _featureService: FeatureService,
        private _userService:UserService)
    {

    }

    getStats(): Observable<any> {
        return forkJoin({
          companies: this._companyService.getAll(),
          features: this._featureService.getAllFeature(),
          veterinarians: this._userService.getVeterinarians(),
          secretaries: this._userService.getSecretaries(),
        }).pipe(
          map(({ companies, features, veterinarians, secretaries }) => {
              const companyData = companies.data;
            const featureData = features;
            const veterinarianData = veterinarians.data;
            const secretaryData = secretaries.data;
      
            return {
              companies: {
                total: companyData.length,
                inactive: companyData.filter(c => c.archived).length
              },
              features: {
                total: featureData.length,
                inactive: featureData.filter(f => f.archived).length
              },
              veterinarians: {
                total: veterinarianData.length,
                inactive: veterinarianData.filter(v => v.archived).length
              },
              secretaries: {
                total: secretaryData.length,
                inactive: secretaryData.filter(s => s.archived).length
              }
            };
          })
        );
      }
      


    //mock api get data
    getData(): Observable<any> {
        return new BehaviorSubject(project).asObservable();
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
