import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { DatePipe, NgClass, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { Notification } from 'app/shared/models/notifications';
import { NotificationService } from 'app/shared/services/notification.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'notifications',
    templateUrl: './notifications.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'notifications',
    imports: [MatButtonModule, MatIconModule, MatTooltipModule, NgClass, NgTemplateOutlet, RouterLink, DatePipe]
})
export class NotificationsComponent implements OnInit, OnDestroy
{
    @ViewChild('notificationsOrigin') private _notificationsOrigin: MatButton;
    @ViewChild('notificationsPanel') private _notificationsPanel: TemplateRef<any>;

    notifications: Notification[];
    unreadCount: number = 0;
    private _overlayRef: OverlayRef;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _notificationsService: NotificationService, 
        private _overlay: Overlay,
        private _viewContainerRef: ViewContainerRef,
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
ngOnInit(): void {
    let previousUnreadCount = 0;
    let previousNotificationCount = 0;

    this._notificationsService.notifications$
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((notifications: Notification[]) => {
            console.log('[Notification Stream] Raw notifications received:', notifications);

            const connectedUserId = localStorage.getItem('connectedUserId');
            console.log('[Notification Stream] Connected userId:', connectedUserId);

            // Step 1: Filter out malformed notifications
            const validNotifications = notifications.filter((n, index) => {
                const isValid = n?.userId && typeof n.read === 'boolean' && n._id;
                if (!isValid) {
                    console.warn(`[Notification ${index}] INVALID - Skipping:`, n);
                }
                return isValid;
            });

            // Step 2: Log valid ones
            validNotifications.forEach((n, index) => {
                console.log(`[Valid Notification ${index}] userId: ${n.userId}, read: ${n.read}, id: ${n._id}, title: ${n.title}`);
            });

            // Step 3: Filter for current user
            const filtered = validNotifications.filter(n => n.userId === connectedUserId);
            console.log('[Notification Stream] Filtered for connected user:', filtered);

            this.notifications = filtered;

            const currentUnreadCount = this.notifications.filter(n => !n.read).length;
            console.log('[Notification Stream] Current unread count:', currentUnreadCount, 'Previous unread count:', previousUnreadCount);

            if (currentUnreadCount > previousUnreadCount) {
                console.log('[Notification Stream] New unread notification detected, playing sound...');
                this.playNotificationSound();
            }

            if (this.notifications.length > previousNotificationCount) {
                console.log('[Notification Stream] Notification count increased. Updating UI...');
                this._changeDetectorRef.markForCheck();
            }

            previousUnreadCount = currentUnreadCount;
            previousNotificationCount = this.notifications.length;

            this._calculateUnreadCount();
        });
}
    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();

        // Dispose the overlay
        if ( this._overlayRef )
        {
            this._overlayRef.dispose();
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Open the notifications panel
     */

    private playNotificationSound(): void {
    const audio = new Audio('assets/sounds/notification.wav');
    audio.load();
    audio.play()
        .then(() => console.log('[Sound] Notification sound played.'))
        .catch(err => console.warn('[Sound] Notification sound error:', err));
}
openPanel(): void {
  if (!this._notificationsPanel || !this._notificationsOrigin) {
    return;
  }

  console.log('Opening panel with notifications:', this.notifications);

  if (!this._overlayRef) {
    this._createOverlay();
  }

  if (this._overlayRef.hasAttached()) {
    this._overlayRef.detach();
  }

  this._overlayRef.attach(new TemplatePortal(this._notificationsPanel, this._viewContainerRef));
  this._changeDetectorRef.detectChanges();
}

    /**
     * Close the notifications panel
     */
    closePanel(): void
    {
        this._overlayRef.detach();
    }

    /**
     * Mark all notifications as read
     */
   markAllAsRead(): void
{
    // Optimistically update local state
    this.notifications = this.notifications.map(notification => ({
        ...notification,
        read: true
    }));

    // Recalculate unread count
    this._calculateUnreadCount();

    // Trigger change detection to update UI
    this._changeDetectorRef.markForCheck();

    // Send the update to the backend
    this._notificationsService.markAllAsRead().subscribe();
}

    /**
     * Toggle read status of the given notification
     */

    toggleRead(notification: Notification): void
    {
        // Toggle the read status
        notification.read = !notification.read;

        // Update the notification
        this._notificationsService.update(notification._id, notification).subscribe();
        this._calculateUnreadCount();
            this._changeDetectorRef.markForCheck();


    }

    /**
     * Archive the given notification
     */
    archive(notification: Notification): void
    {
        this._notificationsService.archiveNotification(notification._id).subscribe(() => {
            // Remove archived notification from the list locally
            this.notifications = this.notifications.filter(n => n._id !== notification._id);
            this._calculateUnreadCount();
            this._changeDetectorRef.markForCheck();
        });
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Create the overlay
     */
    private _createOverlay(): void
    {
        // Create the overlay
        this._overlayRef = this._overlay.create({
            hasBackdrop     : true,
            backdropClass   : 'fuse-backdrop-on-mobile',
            scrollStrategy  : this._overlay.scrollStrategies.block(),
            positionStrategy: this._overlay.position()
                .flexibleConnectedTo(this._notificationsOrigin._elementRef.nativeElement)
                .withLockedPosition(true)
                .withPush(true)
                .withPositions([
                    {
                        originX : 'start',
                        originY : 'bottom',
                        overlayX: 'start',
                        overlayY: 'top',
                    },
                    {
                        originX : 'start',
                        originY : 'top',
                        overlayX: 'start',
                        overlayY: 'bottom',
                    },
                    {
                        originX : 'end',
                        originY : 'bottom',
                        overlayX: 'end',
                        overlayY: 'top',
                    },
                    {
                        originX : 'end',
                        originY : 'top',
                        overlayX: 'end',
                        overlayY: 'bottom',
                    },
                ]),
        });

        // Detach the overlay from the portal on backdrop click
        this._overlayRef.backdropClick().subscribe(() =>
        {
            this._overlayRef.detach();
        });
    }

    /**
     * Calculate the unread count
     *
     * @private
     */
    private _calculateUnreadCount(): void
    {
        let count = 0;

        if ( this.notifications && this.notifications.length )
        {
            count = this.notifications.filter(notification => !notification.read).length;
        }

        this.unreadCount = count;
    }
}
