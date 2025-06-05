import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { Notification } from 'app/shared/models/notifications';
import { NotificationService } from 'app/shared/services/notification.service';

@Component({
  selector: 'app-notifications',
  imports: [ MatPaginatorModule,CommonModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss'
})
export class NotificationsComponent implements OnInit {
  _notificationService = inject(NotificationService);
  notifications: Notification[] = [];
  filteredNotifications: Notification[] = [];
  total = 0;
  currentPage = 1;
  currentSize = 5;
  userId = '';
filteredType: string = '';
allTypes: string[] = [];
  ngOnInit(): void {
    this.userId = localStorage.getItem('connectedUserId') ;
    this.getNotificationTypes(); 
    this.getNotifications();
  }
  getNotificationTypes(): void {
  this._notificationService.getNotificationTypes(this.userId).subscribe({
    next: (types) => {
      this.allTypes = types;
      console.log('All notification types:', this.allTypes);
    },
    error: (err) => {
      console.error('Failed to fetch notification types:', err);
    }
  });
  }
    getNotifications(): void {
    this._notificationService.getNotifications(
  this.currentSize.toString(),
  this.currentPage.toString(),
  this.filteredType,
  false,
  this.userId
).subscribe({
  next: (response) => {
    this.filteredNotifications = response.data;
    this.total = response.total;
  },
  error: (error) => {
    console.error('Error fetching notifications:', error);
  }
});
  }

   pageChanged(event: { pageIndex: number; pageSize: number }): void {
    this.currentPage = event.pageIndex + 1;
    this.currentSize = event.pageSize;
    this.getNotifications();
  }

filterByType(type: string): void {
  this.filteredType = type;
  this.currentPage = 1;
  console.log('Filtering by type:', this.filteredType); // 👈 Add this
  this.getNotifications();
}

  // Track by _id for *ngFor optimization
  trackById(index: number, item: Notification): string {
    return item._id;
  }


}