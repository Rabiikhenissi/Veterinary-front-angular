import { Route } from '@angular/router';
import { ListComponent } from 'app/modules/admin/apps/groups/list/list.component';
import { DetailsComponent } from './list/components/details/details.component';
import { AddComponent } from './add/add.component';
import { EditComponent } from './list/components/edit/edit.component';
import { FeatureActions } from 'app/shared/enums/feature-actions';
import { FeatureCodes } from 'app/shared/enums/feature-codes';

export default [
  {
    path: '',
    children: [
      {
        path: '',
        component: ListComponent,
        data: {
          breadcrumb: 'Groups',
          
        },
      },
      {
        path: 'add',
        component: AddComponent,
        data: {
          breadcrumb: 'Add',
          feature: FeatureCodes.groups,
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
              feature: FeatureCodes.groups,
                                        action: FeatureActions.read,
            },
          },
          {
            path: 'edit',
            component: EditComponent,
            data: {
              breadcrumb: 'Edit',
              feature: FeatureCodes.groups,
                                        action: FeatureActions.update,
            },
          },
        ],
      },
    ],
  },
] as Route[];
