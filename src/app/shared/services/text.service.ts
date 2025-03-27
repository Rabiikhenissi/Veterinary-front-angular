import {inject, Injectable} from '@angular/core';
import { Text } from '../models/text';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pagination } from '../models/pagination';
@Injectable({
  providedIn: 'root',
})
export class TextService {
  endpoint = `${environment.api}/texts`;
  http = inject(HttpClient)
  getList(
      limit: string,
      page: string,
      search: string,
      filterType:string,
      filterStatus:string,
  ): Observable<Pagination<Text>> {
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
    return this.http.get<Pagination<Text>>(`${this.endpoint}/pagination`, {
      params: searchParams,
    });
  }
  getAll(): Observable<Text[]> {
    return this.http.get<Text[]>(`${this.endpoint}/all`);
  }
  deleteOne(id: string): Observable<null> {
    return this.http.delete<null>(`${this.endpoint}/${id}`);
  }
  getOne(id: string): Observable<Text> {
    return this.http.get<Text>(`${this.endpoint}/${id}`);
  }
    createOne(text: Text): Observable<null> {
    return this.http.post<null>(`${this.endpoint}`, { text });
  }
  updateOne(text: Text): Observable<null> {
    return this.http.patch<null>(`${this.endpoint}/${text._id}`, { text });
  }
}
