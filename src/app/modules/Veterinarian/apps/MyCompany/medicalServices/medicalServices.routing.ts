import { Route } from '@angular/router';
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
            path: 'edit',
            component: EditComponent,
            data: {
              breadcrumb: 'edit',
            },
          },
        ],
      },
    ],
  },
] as Route[];
