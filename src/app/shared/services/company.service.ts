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
      filterType:string,
      filterStatus:string,
  ): Observable<Pagination<Company>> {
    let searchParams = new HttpParams();
    searchParams = searchParams.append('limit', limit);
    searchParams = searchParams.append('page', page);
    if (search) {
      searchParams = searchParams.append('search', search);
    }
    if (filterType) {
      searchParams = searchParams.append('filterType', filterType);
    }
    if (filterStatus) {
      searchParams = searchParams.append('filterStatus', filterStatus);
    }
    return this.http.get<Pagination<Company>>(`${this.endpoint}`, {
      params: searchParams,
    });
  }
  getAll(): Observable<Company[]> {
    return this.http.get<Company[]>(`${this.endpoint}/all`);
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
}
