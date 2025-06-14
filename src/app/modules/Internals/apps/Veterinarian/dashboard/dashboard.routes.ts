import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { dashboardVetService } from 'app/shared/services/dashboard-vet.service';
import { DashboardComponent } from './dashboard.component';
import { FeatureCodes } from 'app/shared/enums/feature-codes';
import { FeatureActions } from 'app/shared/enums/feature-actions';

export default [
    {
        path     : '',
        component: DashboardComponent,
        resolve  : {
            data: () => inject(dashboardVetService).getData(),
        },
        data: {
                        
                        },
    },
] as Routes;
