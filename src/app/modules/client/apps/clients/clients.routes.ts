import { Route } from '@angular/router';
import { DetailsComponent } from './list/components/details/details.component';
import { AddComponent } from './add/add.component';
import { EditComponent } from './list/components/edit/edit.component';
import {ListComponent} from "./list/list.component";
import { EditDetailsComponent } from './list/components/edit-details/edit-details.component';
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
          breadcrumb: 'Clients',
        },
      },
      {
        path: 'add',
        component: AddComponent,
        data: {
          breadcrumb: 'Add',
          feature: FeatureCodes.clients,
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
              breadcrumb: 'Profile',
              feature: FeatureCodes.clients,
          action: FeatureActions.read,
            },
          },
          {
            path: 'editDetails',
            component: EditDetailsComponent,
            data: {
              breadcrumb: 'Edit Details',
              feature: FeatureCodes.clients,
          action: FeatureActions.update,
            },
          },
          {
            path: 'edit',
            component: EditComponent,
            data: {
              breadcrumb: 'Edit',
            },
          },{
            path:"pet",
            loadChildren: () => import('./list/components/details/pet/pet.routes').then(m => m.PetRoutingModule),
            
          }
        ]
      }
      
    ],

  },
] as Route[];
