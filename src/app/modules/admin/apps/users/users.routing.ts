import { Route } from '@angular/router';
import { DetailsComponent } from './list/components/details/details.component';
import { AddComponent } from './add/add.component';
import { EditComponent } from './list/components/edit/edit.component';
import {ListComponent} from "./list/list.component";
import { FeatureCodes } from 'app/shared/enums/feature-codes';
import { FeatureActions } from 'app/shared/enums/feature-actions';

export default [
  {
    path: '',
    children: [
      {
        path: '',
        component: ListComponent,
        
      },
      {
        path: 'add',
        component: AddComponent,
        data: {
          breadcrumb: 'Add',
          feature: FeatureCodes.users,
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
              feature: FeatureCodes.users,
        action: FeatureActions.read,
            },
          },
          {
            path: 'edit',
            component: EditComponent,
            data: {
              breadcrumb: 'Edit',
              feature: FeatureCodes.users,
        action: FeatureActions.update,
            },
          },
        ],
      },
    ],
  },
] as Route[];
