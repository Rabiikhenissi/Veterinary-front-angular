import { Route } from '@angular/router';
import { AddComponent } from './add/add.component';
import { EditComponent } from './list/components/edit/edit.component';
import { ListComponent } from './list/list.component';
import { FeatureActions } from 'app/shared/enums/feature-actions';
import { FeatureCodes } from 'app/shared/enums/feature-codes';

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
          feature: FeatureCodes.pet_species,
        action: FeatureActions.create,
        },
      },
      {
        path: ':id',
        children: [
          {
            path: 'edit',
            component: EditComponent,
            data: {
              breadcrumb: 'edit',
              feature: FeatureCodes.pet_species,
        action: FeatureActions.update,
            },
          },
        ],
      },
    ],
  },
] as Route[];
