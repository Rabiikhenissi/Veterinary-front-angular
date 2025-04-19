import { Routes } from '@angular/router';
import { ProfileComponent } from './profile.component';
import { EditComponent } from './edit/edit.component';



export default [
    {
            path: '',
            
            children: [
              {
                path: '',
                component: ProfileComponent,
                
              },
              
              
                {
                  path: ':id/edit',
                  component: EditComponent,
                  data:{breadcrumb: 'edit'},
                }
                ,{
                  path:"pet",
                  loadChildren: () => import('./pet/pet.routes').then(m => m.PetRoutingModule),
                  data:{breadcrumb: null},
                }
                
                
              
            ],

          },
          
] as Routes;
