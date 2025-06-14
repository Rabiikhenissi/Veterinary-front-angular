import { Route } from '@angular/router';
import { ListComponent } from 'app/modules/admin/apps/features/list/list.component';
import { DetailsComponent } from './list/components/details/details.component';
import { AddComponent } from './add/add.component';
import { EditComponent } from './list/components/edit/edit.component';
import { FeatureCodes } from 'app/shared/enums/feature-codes';
import { FeatureActions } from 'app/shared/enums/feature-actions';

export default [
  {
    path: '',
    children: [
      {
        path: '',
        component: ListComponent,
        data: {
          breadcrumb: 'Features',
          
        },
      },
      {
        path: 'add',
        component: AddComponent,
        data: {
          breadcrumb: 'Add',
          feature: FeatureCodes.features,
          action: FeatureActions.create,
        },
      },
      {
        path: ':id',
        
        children: [
          {
            path: '',
            component: DetailsComponent,
            data: {
              breadcrumb: 'Details',
              feature: FeatureCodes.features,
                              action: FeatureActions.read,
            },
          },
          {
            path: 'edit',
            component: EditComponent,
            data: {
              breadcrumb: 'Edit',
              feature: FeatureCodes.features,
                              action: FeatureActions.update,
            },
          },
        ],
      },
    ],
  },
] as Route[];
