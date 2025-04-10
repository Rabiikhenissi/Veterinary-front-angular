import { Route, Routes } from '@angular/router';
import { CalendarComponent } from './calendar.component';
import { EditComponent } from './components/edit/edit.component';
import { DetailsComponent } from './components/details/details.component';
import { AddComponent } from './add/add.component';

export default [
  {
    path: '',
    children: [
      {
        path: '',
        component: CalendarComponent,
        data: {
          breadcrumb: 'Calendar',
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
