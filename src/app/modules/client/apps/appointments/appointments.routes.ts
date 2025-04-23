import { Routes } from '@angular/router';
import { ListComponent } from './list/list.component';

export default [
    {
        path     : '',
        component: ListComponent,
        data    : {
            breadcrumb: 'Appointments',
        }
    },
] as Routes;
