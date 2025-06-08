import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { Notification } from 'app/shared/models/notifications';
import { LoadingService } from 'app/shared/services/loading.service';
import { NotificationService } from 'app/shared/services/notification.service';
import { forkJoin } from 'rxjs';

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
  _loadingService = inject(LoadingService);
  total = 0;
  currentPage = 1;
  currentSize = 5;
  userId = '';
filteredType: string = '';
allTypes: string[] = [];
  ngOnInit(): void {
    this.userId = localStorage.getItem('connectedUserId');
    this._loadingService.show();

    forkJoin({
      types: this._notificationService.getNotificationTypes(this.userId),
      notifications: this._notificationService.getNotifications(
        this.currentSize.toString(),
        this.currentPage.toString(),
        this.filteredType,
        false,
        this.userId
      )
    }).subscribe({
      next: ({ types, notifications }) => {
        this.allTypes = types;
        this.filteredNotifications = notifications.data;
        this.total = notifications.total;
        this._loadingService.hide();
      },
      error: (err) => {
        this._loadingService.hide();
        console.error('Failed to fetch notifications or types:', err);
      }
    });
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
      this._loadingService.show();
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
    this._loadingService.hide();
  },
  error: (error) => {
    this._loadingService.hide();
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