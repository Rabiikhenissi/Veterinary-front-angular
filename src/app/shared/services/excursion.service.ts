import {inject, Injectable} from '@angular/core';
import { Excursion } from '../models/excursion';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pagination } from '../models/pagination';
@Injectable({
  providedIn: 'root',
})
export class ExcursionService {
  endpoint = `${environment.api}/excursions`;
  http = inject(HttpClient)
  getList(
      limit: string,
      page: string,
      search: string,
      filterType:string,
      filterStatus:string,
  ): Observable<Pagination<Excursion>> {
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
    return this.http.get<Pagination<Excursion>>(`${this.endpoint}`, {
      params: searchParams,
    });
  }
  getAll(): Observable<Excursion[]> {
    return this.http.get<Excursion[]>(`${this.endpoint}/all`);
  }
  deleteOne(id: string): Observable<null> {
    return this.http.delete<null>(`${this.endpoint}/${id}`);
  }
  getOne(id: string): Observable<Excursion> {
    return this.http.get<Excursion>(`${this.endpoint}/${id}`);
  }
    createOne(excursion: Excursion): Observable<null> {
    return this.http.post<null>(`${this.endpoint}`, { excursion });
  }
  updateOne(excursion: Excursion): Observable<null> {
    return this.http.patch<null>(`${this.endpoint}/${excursion._id}`, { excursion });
  }
}
