import { inject } from '@angular/core';
import { Routes } from '@angular/router';


import { DashboardComponent } from './dashboard.component';
import { FeatureCodes } from 'app/shared/enums/feature-codes';
import { FeatureActions } from 'app/shared/enums/feature-actions';

export default [
    {
        path     : '',
        component: DashboardComponent,
        data     : {
            breadCrumb: 'Dashboard',
        }
    },
] as Routes;
