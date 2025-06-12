
import { Component, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {  Router, RouterOutlet } from '@angular/router';
import {FuseNavigationItem, FuseNavigationService, FuseVerticalNavigationComponent} from '@fuse/components/navigation';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { Subject, takeUntil } from 'rxjs';
import {MenuService} from "../../../../shared/services/menu.service";
import { BreadcrumbsComponent } from "../../../../shared/components/breadcrumbs/breadcrumbs.component";
import { CartService } from 'app/shared/services/cart.service';
import { NotificationsComponent } from "../../../common/notifications/notifications.component";
import { CommonModule } from '@angular/common';
import { NotificationService } from 'app/shared/services/notification.service';

@Component({
    selector: 'classy-layout',
    templateUrl: './classy.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [FuseVerticalNavigationComponent, MatIconModule, MatButtonModule,CommonModule, RouterOutlet, BreadcrumbsComponent, NotificationsComponent]
})
export class ClassyLayoutComponent implements OnInit, OnDestroy
{
    isScreenSmall: boolean;
    navigation: FuseNavigationItem[];
    user: User;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    private _notificationService= inject(NotificationService);
    isLoading: boolean = true;

    itemCount: number = 0;
    showCart: boolean = false;
    /**
     * Constructor
     */
    constructor(
        private menuService: MenuService,
        private _router: Router,
        private _navigationService: NavigationService,
        private _userService: UserService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _fuseNavigationService: FuseNavigationService,
        private _cartService: CartService,
    )
    {
    }


    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    
    ngOnInit(): void
    {
        this.menuService.getMenu().subscribe({
            next: (data) => {
                this.navigation = data.menu;
                this.isLoading = false;
                console.log('this.navigation', this.navigation)
            },
            error: () => {
                this.isLoading = false;
                console.error('Failed to load menu');
            },
        });


        // Subscribe to the user service
        this._userService.user$
            .pipe((takeUntil(this._unsubscribeAll)))
            .subscribe((user: User) =>
            {
                this.user = user;
            });

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({matchingAliases}) =>
            {
                // Check if the screen is small
                this.isScreenSmall = !matchingAliases.includes('md');
            });

            this._router.events.subscribe(() => {
                this.showCart = this._router.url.includes('/shop');
              });
            const userId = localStorage.getItem('connectedUserId');

    if (userId) {
        this._notificationService.init(userId);
        console.log('[Layout Init] NotificationService initialized with user ID:', userId);
    } else {
        console.warn('[Layout Init] No connectedUserId in localStorage!');
    }
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle navigation
     *
     * @param name
     */
    toggleNavigation(name: string): void
    {
        // Get the navigation
        const navigation = this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>(name);

        if ( navigation )
        {
            // Toggle the opened status
            navigation.toggle();
        }
    }


    
}
