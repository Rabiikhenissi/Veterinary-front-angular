import {inject, Injectable} from '@angular/core';
import { Page } from '../models/page';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pagination } from '../models/pagination';
@Injectable({
  providedIn: 'root',
})
export class PageService {
  endpoint = `${environment.api}/pages`;
  http = inject(HttpClient)
  getList(
      limit: string,
      page: string,
      search: string,
      filterType:string,
      filterStatus:string,
  ): Observable<Pagination<Page>> {
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
    return this.http.get<Pagination<Page>>(`${this.endpoint}`, {
      params: searchParams,
    });
  }
  getAll(): Observable<Page[]> {
    return this.http.get<Page[]>(`${this.endpoint}/all`);
  }
  deleteOne(id: string): Observable<null> {
    return this.http.delete<null>(`${this.endpoint}/${id}`);
  }
  getOne(id: string): Observable<Page> {
    return this.http.get<Page>(`${this.endpoint}/${id}`);
  }
    createOne(page: Page): Observable<null> {
    return this.http.post<null>(`${this.endpoint}`, { page });
  }
  updateOne(page: Page): Observable<null> {
    return this.http.patch<null>(`${this.endpoint}/${page._id}`, { page });
  }
}
