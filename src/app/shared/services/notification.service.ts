import { inject, Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Notification } from '../models/notifications';

@Injectable({
  providedIn: 'root',
})
export class NotificationService implements OnDestroy {
  endpoint = `${environment.api}/notifications`;
  private ws: WebSocket;
  private _notifications = new BehaviorSubject<Notification[]>([]);
  notifications$ = this._notifications.asObservable();
  http = inject(HttpClient);
  private userId: string = '';

  constructor() {
   
  }
init(userId: string): void {
    if (!userId) return;

    this.userId = userId;
    this._connectWebSocket();
    this._loadInitialNotifications();
  }
  private _connectWebSocket(): void {
    const userId = localStorage.getItem('connectedUserId');
this.ws = new WebSocket(`${environment.websocketUrl}?userId=${userId}`);


    this.ws.onopen = () => {
      console.log('WebSocket connected');
    };

    this.ws.onmessage = (event) => {
      const newNotification: Notification = JSON.parse(event.data);
      const currentNotifications = this._notifications.getValue();

      // Add new notification at the beginning
      this._notifications.next([newNotification, ...currentNotifications]);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error', error);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected. Reconnecting in 5 seconds...');
      setTimeout(() => this._connectWebSocket(), 5000);
    };
  }

  public _loadInitialNotifications(): void {
    const userId = localStorage.getItem('connectedUserId') || '';
    console.log('User ID:', userId);
    
    this.getNotifications('5', '0', '',false, userId).subscribe({
      next: (response) => {
        console.log('Initial notifications:', response.data);
        this._notifications.next(response.data);
      },
      error: (error) => {
        console.error('Error fetching initial notifications:', error);
      },
    } );
  }

  // Get Notifications
  getNotifications(
    limit: string,
    page: string,
    type: string,
    includeArchived: boolean = false ,
    userId?: string
  ): Observable<any> {
    let params = new HttpParams()
      .set('userId', userId || '')
      .set('page', page)
      .set('limit', limit);

    if (type) {
      params = params.set('type', type);
    }
 if (includeArchived) {
  params = params.set('includeArchived', 'true');
}
    return this.http.get<any>(`${this.endpoint}`, { params });
  }

  // Get Notification types
  getNotificationTypes(userId: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.endpoint}/types?userId=${userId}`);
  }

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
  createNotification(notification: {
    userId: string;
    title: string;
    message: string;
    type: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.endpoint}`, notification);
  }

  // Mark all notifications as read
  markAllAsRead(): Observable<any> {
  const userId = localStorage.getItem('connectedUserId') || '';
  return this.http.patch(`${this.endpoint}/read-all`, { userId }).pipe(
    tap(() => {
      this.getNotifications('5', '0', '', false, userId).subscribe({
        next: (response) => {
          this._notifications.next(response.data);
        },
        error: (err) => {
          console.error('[markAllAsRead] Failed to refresh notifications:', err);
        }
      });
    })
  );
}

  // Update a notification (PATCH)
  update(id: string, notification: Notification): Observable<any> {
    return this.http.patch(`${this.endpoint}/${id}`, notification);
  }

  // Archive a notification
  archiveNotification(id: string): Observable<any> {
  return this.http.patch(`${this.endpoint}/${id}/archive`, {}).pipe(
    tap(() => {
      // Remove archived notification from cache immediately
      const currentNotifications = this._notifications.getValue();
      const updatedNotifications = currentNotifications.filter(n => n._id !== id);
      this._notifications.next(updatedNotifications);
    })
  );
}
  // Cleanup WebSocket on destroy
  ngOnDestroy(): void {
    if (this.ws) {
      this.ws.close();
    }
  }
  clearNotificationsCache(): void {
  this._notifications.next([]);
}

}