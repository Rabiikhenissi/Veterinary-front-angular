import {inject, Injectable} from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {  Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Pagination } from '../models/pagination';
import { Appointment, Appointment2 } from '../models/appointment';



@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  endpoint = `${environment.api}/appointments`;

  http = inject(HttpClient);

  // Get list of appointments
  getAppointments(
    limit: string,
    page: string,
    search: string,
    companyId: string,
  ): Observable<Pagination<Appointment>> {
    let searchParams = new HttpParams();
    searchParams = searchParams.append('limit', limit);
    searchParams = searchParams.append('page', page);
    searchParams = searchParams.append('companyId', companyId);
    
    if (search) {
      searchParams = searchParams.append('search', search);
    }
    return this.http.get<Pagination<Appointment>>(`${this.endpoint}`, {
      params: searchParams,
    });
  }

  getAll()  : Observable<any> {
    return this.http.get<any>(`${this.endpoint}/all`);
  }

  

  getTopCompaniesComparison()  {
    return this.http.get<any[]>(`${this.endpoint}/top-companies-comparison`);
  }
  

  getAppointment(id: string): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.endpoint}/${id}`);
  }

  getAppointmentsByUser(
    
    limit: string,
    page: string,
    search: string,
    userId: string,
  ): Observable<Pagination<Appointment>> {
    let searchParams = new HttpParams()
      .set('limit', limit)
      .set('page', page);
  
    if (search) {
      searchParams = searchParams.set('search', search);
    }
  
    return this.http.get<Pagination<Appointment>>(
      `${this.endpoint}/user/${userId}`,
      { params: searchParams }
    );
  }
  
  getAppointmentsByPet(
    limit: string,
    page: string,
    search: string,
    petId: string
  ): Observable<Pagination<Appointment>> {
    let searchParams = new HttpParams()
      .set('limit', limit)
      .set('page', page);
  
    if (search) {
      searchParams = searchParams.set('search', search);
    }
  
    return this.http.get<Pagination<Appointment>>(
      `${this.endpoint}/pet/${petId}`,
      { params: searchParams }
    );
  }
  getAllByCompany(
    companyId: string,): Observable<Appointment[]> {
      return this.http.get<Appointment[]>(`${this.endpoint}/all-by-company/${companyId}`);
  }


  createAppointment(appointment: Appointment): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.endpoint}`, appointment);
  }

  updateAppointment(appointment: Appointment2): Observable<Appointment2> {
    return this.http.patch<Appointment2>(`${this.endpoint}/${appointment._id}`, {appointment});
  }
  updateAppointmentStatus(appointment:Appointment2):Observable<Appointment2> {
    return this.http.patch<Appointment2>(`${this.endpoint}/${appointment._id}/status`, appointment);
  }
  archiveAppointment(id: string): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.endpoint}/archive/${id}`, {});
  }
  addAppointmentInfo(id: string, info: any): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.endpoint}/info/${id}`, info);
  }
  updateAppointmentInfo(id: string, info: any): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.endpoint}/info/update/${id}`, info);
  }

  getPrescriptionPdf(prescriptionId: string) {
    return this.http.get(`${this.endpoint}/prescription/${prescriptionId}/pdf`, {
      responseType: 'blob',
    });
  }
  getInvoicePdf(invoiceId: string) {
    return this.http.get(`${this.endpoint}/invoice/${invoiceId}/pdf`, {
      responseType: 'json',
    });
  }
  isAvailable(date: string, time: string, companyId: string,id: string): Observable<{ available: boolean }> {
    return this.http.post<{ available: boolean }>(`${this.endpoint}/check`, {
      date,
      time,
      companyId,
      id
    });
  }



}
