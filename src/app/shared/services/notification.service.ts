import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  endpoint = `${environment.api}/notifications`;

  http = inject(HttpClient);

  // Send SMS notification
  sendSMSNotification(phoneNumber: string, message: string): Observable<any> {
    const body = { phoneNumber, message };
    return this.http.post<any>(`${this.endpoint}/sms`, body);
  }

  // Send Email notification
  sendEmailNotification(
    to: string,
    subject: string,
    text: string,
    pdfBuffer: any = null,
    filename: string = 'attachment.pdf'
  ): Observable<any> {
    const body = { to, subject, text, pdfBuffer, filename };
    return this.http.post<any>(`${this.endpoint}/email`, body);
  }

  // Create Notification
  createNotification(
    notification: { userId: string; title: string; message: string; type: string }
  ): Observable<any> {
    return this.http.post<any>(`${this.endpoint}`, notification);
  }
}
