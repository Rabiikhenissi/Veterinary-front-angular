import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { dashboardVetService } from 'app/shared/services/dashboard-vet.service';
import { DashboardComponent } from './dashboard.component';

export default [
    {
        path     : '',
        component: DashboardComponent,
        resolve  : {
            data: () => inject(dashboardVetService).getData(),
        },
    },
] as Routes;
