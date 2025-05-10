import { inject } from '@angular/core';
import { Routes } from '@angular/router';


import { ProjectComponent } from './dashboard.component';
import { ProjectService } from '../../../../shared/services/dashboard.service';

export default [
    {
        path     : '',
        component: ProjectComponent,
        data     : {
            breadCrumb: 'Dashboard',}
    },
] as Routes;
