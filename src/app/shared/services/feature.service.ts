import {inject, Injectable} from '@angular/core';
import { Feature } from '../models/feature';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pagination } from '../models/pagination';
@Injectable({
  providedIn: 'root',
})
export class FeatureService {
  endpoint = `${environment.api}/features`;

  http = inject(HttpClient)
  // get features
  getFeatures(
      limit: string,
      page: string,
      search: string,
      filterType:string,
      filterStatus:string,
  ): Observable<Pagination<Feature>> {
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
    return this.http.get<Pagination<Feature>>(`${this.endpoint}`, {
      params: searchParams,
    });
  }
  getFeatureParent(): Observable<Feature[]> {
    return this.http.get<Feature[]>(`${this.endpoint}/parents`);
  }
  getAllFeature(): Observable<Feature[]> {
    return this.http.get<Feature[]>(`${this.endpoint}/all`);
  }
  deleteFeature(id: string): Observable<null> {
    return this.http.delete<null>(`${this.endpoint}/${id}`);
  }
  getFeature(id: string): Observable<Feature> {
    return this.http.get<Feature>(`${this.endpoint}/${id}`);
  }
  updateFeature(feature: Feature): Observable<null> {
    return this.http.patch<null>(`${this.endpoint}/${feature._id}`, { feature });
  }
  createFeature(feature: Feature): Observable<null> {
    return this.http.post<null>(`${this.endpoint}`, { feature });
  }
  getFeatureByCode(link: string): Observable<Feature> {
    return this.http.post<Feature>(`${this.endpoint}/link`, { link });
  }
}
