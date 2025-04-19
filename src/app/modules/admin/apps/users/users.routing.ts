import { Route } from '@angular/router';
import { DetailsComponent } from './list/components/details/details.component';
import { AddComponent } from './add/add.component';
import { EditComponent } from './list/components/edit/edit.component';
import {ListComponent} from "./list/list.component";

export default [
  {
    path: '',
    children: [
      {
        path: '',
        component: ListComponent,
        data: {
          breadcrumb: 'Companies',
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
              breadcrumb: 'Details',
            },
          },
          {
            path: 'edit',
            component: EditComponent,
            data: {
              breadcrumb: 'Edit',
            },
          },
        ],
      },
    ],
  },
] as Route[];
