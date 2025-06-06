import {inject, Injectable} from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pagination } from '../models/pagination';
import { MedicalServices } from '../models/medicalServices';
@Injectable({
  providedIn: 'root',
})
export class MedicalServicesService {
  endpoint = `${environment.api}/medicalServices`;
  http = inject(HttpClient)
 getList(
  limit: string,
  page: string,
  search: string,
  companyId: string, 
  archived?: boolean
): Observable<Pagination<MedicalServices>> {
  let searchParams = new HttpParams()
    .set('limit', limit)
    .set('page', page);

  if (search) {
    searchParams = searchParams.set('search', search);
  }

  if (companyId) {
    searchParams = searchParams.set('companyId', companyId); 
  }

  if (archived !== null && archived !== undefined) {
    searchParams = searchParams.set('archived', archived.toString());
  }

  return this.http.get<Pagination<MedicalServices>>(`${this.endpoint}`, {
    params: searchParams,
  });
}

  getAll(companyId?: string): Observable<{ data: MedicalServices[], total: number }> {
  let params = new HttpParams();
  if (companyId) {
    params = params.set('companyId', companyId);
  }
  return this.http.get<{ data: MedicalServices[], total: number }>(`${this.endpoint}/all`, { params });
}
  deleteOne(id: string): Observable<null> {
    return this.http.delete<null>(`${this.endpoint}/${id}`);
  }
  getOne(id: string): Observable<MedicalServices> {
    return this.http.get<MedicalServices>(`${this.endpoint}/${id}`);
  }
    createOne(medicalService: MedicalServices): Observable<null> {
    return this.http.post<null>(`${this.endpoint}`, { medicalService });
  }
  updateOne(medicalServices: MedicalServices): Observable<null> {
    return this.http.patch<null>(`${this.endpoint}/${medicalServices._id}`,  medicalServices );
  }
 
archiveOne(id: string): Observable<null> {
  return this.http.patch<null>(`${this.endpoint}/${id}/archive`, {});
}

restoreOne(id: string): Observable<null> {
  return this.http.patch<null>(`${this.endpoint}/${id}/restore`, {});
}
}
