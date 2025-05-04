import { Routes } from '@angular/router';
import { ListComponent } from './list/list.component';
import { DetailsComponent } from './list/details/details.component';

export default [
    {
        path     : '',
        children:[
            {
                path     : '',
                component: ListComponent,
                
            },
            {
                path     : ':id',
                component:DetailsComponent,
                data     : {
                    breadcrumb: 'Details',
                }
            }
        ]
    },
] as Routes;
