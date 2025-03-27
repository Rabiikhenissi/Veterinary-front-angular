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
    {path: 'signed-in-redirect', pathMatch : 'full', redirectTo: 'home/features'},

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
                    breadcrumb: {
                        label: 'Home',
                        info: { myData: { icon: 'home', iconType: 'material' } },
                    },
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
                    
                ],
            },
        ],
    },

    { path: '**', redirectTo: '' },

];
