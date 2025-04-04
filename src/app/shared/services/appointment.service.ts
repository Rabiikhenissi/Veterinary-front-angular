import {inject, Injectable} from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {  Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Pagination } from '../models/pagination';
import { Appointment } from '../models/appointment';
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
    search: string
  ): Observable<Pagination<Appointment>> {
    let searchParams = new HttpParams();
    searchParams = searchParams.append('limit', limit);
    searchParams = searchParams.append('page', page);
    if (search) {
      searchParams = searchParams.append('search', search);
    }
    return this.http.get<Pagination<Appointment>>(`${this.endpoint}`, {
      params: searchParams,
    });
  }

  getAppointment(id: string): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.endpoint}/${id}`);
  }

  createAppointment(appointment: Appointment): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.endpoint}`, appointment);
  }

  updateAppointment(appointment: Appointment): Observable<Appointment> {
    return this.http.patch<Appointment>(`${this.endpoint}/${appointment._id}`, appointment);
  }

  deleteAppointment(id: string): Observable<null> {
    return this.http.delete<null>(`${this.endpoint}/${id}`);
  }
}