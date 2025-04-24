import {inject, Injectable} from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {  Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Pagination } from '../models/pagination';
import { Prescription } from '../models/prescription';
@Injectable({
  providedIn: 'root',
})
export class PrescriptionService {
  endpoint = `${environment.api}/prescriptions`;

  http = inject(HttpClient);

  // Get list of prescriptions
  getPrescriptions(
    limit: string,
    page: string,
    search: string
  ): Observable<Pagination<Prescription>> {
    let searchParams = new HttpParams();
    searchParams = searchParams.append('limit', limit);
    searchParams = searchParams.append('page', page);
    if (search) {
      searchParams = searchParams.append('search', search);
    }
    return this.http.get<Pagination<Prescription>>(`${this.endpoint}`, {
      params: searchParams,
    });
  }

  // Get a specific prescription by ID
  getPrescription(id: string): Observable<Prescription> {
    return this.http.get<Prescription>(`${this.endpoint}/${id}`);
  }

  // Create a new prescription
  createPrescription(prescription: Partial<Prescription>): Observable<Prescription> {
    return this.http.post<Prescription>(`${this.endpoint}`, prescription);
  }

  // Update an existing prescription
  updatePrescription(prescription: Prescription): Observable<Prescription> {
    return this.http.patch<Prescription>(`${this.endpoint}/${prescription._id}`, prescription);
  }

  // Archive a prescription
  archivePrescription(id: string): Observable<Prescription> {
    return this.http.patch<Prescription>(`${this.endpoint}/archive/${id}`, {});
  }



  // Generate PDF for a prescription
  generatePrescriptionPDF(id: string): Observable<Blob> {
    return this.http.get<Blob>(`${this.endpoint}/${id}/pdf`, { responseType: 'blob' as 'json' });
  }
  
 
}