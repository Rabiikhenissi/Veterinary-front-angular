import { Routes } from '@angular/router';
import { ProfileComponent } from './profile.component';



export default [
    {
            path: '',
            component: ProfileComponent,
            data: {
              breadcrumb: 'Profile',
            },
          },
] as Routes;
