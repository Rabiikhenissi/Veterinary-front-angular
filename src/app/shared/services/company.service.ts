import {inject, Injectable} from '@angular/core';
import { Company } from '../models/company';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pagination } from '../models/pagination';
@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  endpoint = `${environment.api}/companies`;
  http = inject(HttpClient)
  getList(
      limit: string,
      page: string,
      search: string,
      archived?:boolean,
  ): Observable<Pagination<Company>> {
    let searchParams = new HttpParams();
    searchParams = searchParams.append('limit', limit);
    searchParams = searchParams.append('page', page);
    if (search) {
      searchParams = searchParams.append('search', search);
    }
    if (archived !== undefined) {
        searchParams = searchParams.set('archived', archived.toString());
    }
    return this.http.get<Pagination<Company>>(`${this.endpoint}`, {
      params: searchParams,
    });
  }
  getAll(): Observable<{ data: Company[], total: number }> {
    return this.http.get<{ data: Company[], total: number }>(`${this.endpoint}/all`);
  }
  deleteOne(id: string): Observable<null> {
    return this.http.delete<null>(`${this.endpoint}/${id}`);
  }
  getOne(id: string): Observable<Company> {
    return this.http.get<Company>(`${this.endpoint}/${id}`);
  }
    createOne(company: Company): Observable<null> {
    return this.http.post<null>(`${this.endpoint}`, { company });
  }
  updateOne(company: Company): Observable<null> {
    return this.http.patch<null>(`${this.endpoint}/${company._id}`, { company });
  }
  updateVisitSetUp(companyId: string, businessHours: any, visitPrice: number): Observable<any> {
  return this.http.patch(`${this.endpoint}/${companyId}/visitSetUp`, { businessHours, visitPrice });
}
archiveOne(id: string): Observable<null> {
  return this.http.patch<null>(`${this.endpoint}/${id}/archive`, {});
}

restoreOne(id: string): Observable<null> {
  return this.http.patch<null>(`${this.endpoint}/${id}/restore`, {});
}
}
