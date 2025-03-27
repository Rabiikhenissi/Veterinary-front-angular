import { Route } from '@angular/router';
import { ListComponent } from 'app/modules/admin/apps/features/list/list.component';
import { DetailsComponent } from './list/components/details/details.component';
import { AddComponent } from './add/add.component';
import { EditComponent } from './list/components/edit/edit.component';

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
        },
      },
      {
        path: ':id',
        children: [
          {
            path: '',
            component: DetailsComponent,
          },
          {
            path: 'edit',
            component: EditComponent,
          },
        ],
      },
    ],
  },
] as Route[];
