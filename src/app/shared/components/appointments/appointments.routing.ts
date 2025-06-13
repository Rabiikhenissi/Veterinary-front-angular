import { Route, Routes } from '@angular/router';
import { CalendarComponent } from './appointments.component';
import { EditComponent } from './components/edit/edit.component';
import { DetailsComponent } from './components/details/details.component';
import { AddComponent } from './add/add.component';
import { AddInfoComponent } from './components/info/add-info/add-info.component';
import { PrescriptionComponent } from './components/prescription/prescription.component';
import { EditInfoComponent } from './components/info/edit-info/edit-info.component';

export default [
  {
    path: '',
    children: [
      {
        path: '',
        component: CalendarComponent,
        data: {
          breadcrumb: 'Appointments',
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
              {
                path: 'info',
                children: [
                  {
                    path: '',
                    component: AddInfoComponent, 
                    data: {
                      breadcrumb: 'Add Info',
                    },
                  },
                  {
                    path: 'edit',
                    component: EditInfoComponent,  
                    data: {
                      breadcrumb: 'Edit Info',
                    },
                  },
                ],
              },
              {
                path: 'prescription',
                component: PrescriptionComponent,
                data: {
                  breadcrumb: 'Prescription',
                },
              }
            ],
          },
     
    ],
  },
] as Route[];
