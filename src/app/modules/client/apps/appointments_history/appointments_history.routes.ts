import { Routes } from '@angular/router';
import { ListComponent } from './list/list.component';
import { DetailsComponent } from './list/details/details.component';
import { FeatureCodes } from 'app/shared/enums/feature-codes';
import { FeatureActions } from 'app/shared/enums/feature-actions';

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
                    feature: FeatureCodes.appointments_history,
                        action: FeatureActions.read,
                }
            }
        ]
    },
] as Routes;
