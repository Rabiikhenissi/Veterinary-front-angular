import { Route, Routes } from '@angular/router';
import { CalendarComponent } from './calendar.component';

export default [
  {
    path: '',
    children: [
      {
        path: '',
        component: CalendarComponent,
        data: {
          breadcrumb: 'Features',
        },
      },
    
     
    ],
  },
] as Route[];
