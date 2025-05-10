import { Route } from '@angular/router';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';
import {FeatureCodes} from "./shared/enums/feature-codes";
import { IsAuthorizedGuard } from 'app/core/auth/guards/isAuthorized.guard';

// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [

    // Redirect empty path to '/example'
    {path: '', pathMatch : 'full', redirectTo: 'home/features'},

    // Redirect signed-in user to the '/example'
    //
    // After the user signs in, the sign-in page will redirect the user to the 'signed-in-redirect'
    // path. Below is another redirection for that path to redirect the user to the desired
    // location. This is a small convenience to keep all main routes together here on this file.
    {path: 'signed-in-redirect', pathMatch : 'full', redirectTo: 'home/profile'},

    // Auth routes for guests
    {
        path: '',
        canActivate: [NoAuthGuard],
        canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'forgot-password', loadChildren: () => import('app/modules/auth/forgot-password/forgot-password.routes')},
            {path: 'reset-password', loadChildren: () => import('app/modules/auth/reset-password/reset-password.routes')},
            {path: 'sign-in', loadChildren: () => import('app/modules/auth/sign-in/sign-in.routes')},
        ]
    },

    // Auth routes for authenticated users
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'sign-out', loadChildren: () => import('app/modules/auth/sign-out/sign-out.routes')},
        ]
    },

    // Landing routes
    {
        path: '',
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'home', loadChildren: () => import('app/modules/landing/home/home.routes')},
        ]
    },

    // Admin routes
    {
        path: '',
        component: LayoutComponent,
        children: [
            // home
            {
                path: 'home',
                data: {
                    breadcrumb: 'Home',
                  },
                children: [
                    {
                        path: '',
                        pathMatch: 'full',
                        redirectTo: 'features',
                    },
                    {
                        canActivate: [IsAuthorizedGuard],
                        canActivateChild: [IsAuthorizedGuard],
                        path: 'companies',
                        data: {
                            breadcrumb: 'Companies',
                            feature: FeatureCodes.companies,
                        },
                        loadChildren: () => import('app/modules/admin/apps/companies/companies.routing'),
                    },
                    {
                        canActivate: [IsAuthorizedGuard],
                        canActivateChild: [IsAuthorizedGuard],
                        path: 'features',
                        data: {
                            breadcrumb: 'Features',
                            feature: FeatureCodes.features,
                        },
                        loadChildren: () => import('app/modules/admin/apps/features/features.routing'),
                    },
                    {
                        canActivate: [IsAuthorizedGuard],
                        canActivateChild: [IsAuthorizedGuard],
                        path: 'groups',
                        data: {
                            breadcrumb: 'Groups',
                            feature: FeatureCodes.groups,
                        },
                        loadChildren: () => import('app/modules/admin/apps/groups/groups.routing'),
                    },
                    {
                        canActivate: [IsAuthorizedGuard],
                        canActivateChild: [IsAuthorizedGuard],
                        path: 'users',
                        data: {
                            breadcrumb: 'Users',
                            feature: FeatureCodes.users,
                        },
                        loadChildren: () => import('app/modules/admin/apps/users/users.routing'),
                    },
                    {
                        canActivate: [IsAuthorizedGuard],
                        canActivateChild: [IsAuthorizedGuard],
                        path: 'texts',
                        data: {
                            breadcrumb: 'Texts',
                            feature: FeatureCodes.texts,
                        },
                        loadChildren: () => import('app/modules/admin/apps/texts/texts.routing'),
                    },
                    {
                        canActivate: [IsAuthorizedGuard],
                        canActivateChild: [IsAuthorizedGuard],
                        path: 'pages',
                        data: {
                            breadcrumb: 'Pages',
                            feature: FeatureCodes.pages,
                        },
                        loadChildren: () => import('app/modules/admin/apps/pages/pages.routing'),
                    },
                    {
                         canActivate: [IsAuthorizedGuard],
                         canActivateChild: [IsAuthorizedGuard],
                        path:'appointments',
                        data: {
                            breadcrumb: 'Appointments',
                            feature: FeatureCodes.appointments,
                        },
                        loadChildren: () => import('app/modules/client/apps/appointments/appointments.routing'),
                    },
                    {
                        canActivate: [IsAuthorizedGuard],
                        canActivateChild: [IsAuthorizedGuard],
                        path: 'profile',
                        data: {
                            breadcrumb: 'Profile',
                            feature: FeatureCodes.profile,
                        },
                        loadChildren: () => import('app/modules/client/apps/profile/profile.routes'),
                    },
                    {
                        canActivate: [IsAuthorizedGuard],
                        canActivateChild: [IsAuthorizedGuard],
                        path: 'clients',
                        data: {
                            breadcrumb: 'Clients',
                            feature: FeatureCodes.clients,
                        },
                        loadChildren: () => import('app/modules/client/apps/clients/clients.routes'),
                        
                    },
                    {
                        canActivate: [IsAuthorizedGuard],
                        canActivateChild: [IsAuthorizedGuard],
                        path:'shop',
                        data: {
                            breadcrumb: 'Shop',
                            feature: FeatureCodes.shop,
                        },
                        loadChildren: () => import('app/modules/client/apps/shop/shop.routes'),
                    },
                    {
                        canActivate: [IsAuthorizedGuard],
                        canActivateChild: [IsAuthorizedGuard],
                        path:'stock',
                        data: {
                            breadcrumb: 'Stock',
                            feature: FeatureCodes.stock,
                        },
                        loadChildren: () => import('app/modules/Veterinarian/apps/stock/stock.routing'),
                    },
                    {
                        canActivate: [IsAuthorizedGuard],
                        canActivateChild: [IsAuthorizedGuard],
                        path:'invoices',
                        data: {
                            breadcrumb: 'Invoices',
                            feature: FeatureCodes.invoices,
                        },
                        loadChildren: () => import('app/modules/client/apps/invoices/invoices.routes'),
                    },
                    {
                        canActivate: [IsAuthorizedGuard],
                        canActivateChild: [IsAuthorizedGuard],
                        path:'appointments-history',
                        data: {
                            breadcrumb: 'Appointments History',
                            feature: FeatureCodes.appointments_history,
                    },
                        loadChildren: () => import('app/modules/client/apps/appointments_history/appointments_history.routes'),
                    },
                    {
                        canActivate: [IsAuthorizedGuard],
                        canActivateChild: [IsAuthorizedGuard],

                        path:'dashboard',
                        data: {
                            breadcrumb: 'dashboard',
                            feature: FeatureCodes.dashboard,
                        },
                        loadChildren: () => import('app/modules/admin/apps/dashboard/dashboard.routes'),
                     },
                    {
                        canActivate: [IsAuthorizedGuard],
                        canActivateChild: [IsAuthorizedGuard],

                        path:'pet-species',
                        data: {
                            breadcrumb: 'Pet Species',
                            feature: FeatureCodes.pet_species,
                    },
                        loadChildren: () => import('app/modules/Veterinarian/apps/MyCompany/pets/pets.routing'),
                    },

                    
                    
                ],
            },
        ],
    },

    { path: '**', redirectTo: '' },

];
