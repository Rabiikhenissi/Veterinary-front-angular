import { Route } from '@angular/router';
import { DetailsComponent } from './list/components/details/details.component';
import { AddComponent } from './add/add.component';
import { EditComponent } from './list/components/edit/edit.component';
import {ListComponent} from "./list/list.component";
import { EditDetailsComponent } from './list/components/edit-details/edit-details.component';

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
            },
          },
          {
            path: 'editDetails',
            component: EditDetailsComponent,
            data: {
              breadcrumb: 'Edit Details',
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
