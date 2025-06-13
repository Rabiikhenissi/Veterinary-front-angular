import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddComponent } from './add/add.component';
import { DetailsComponent } from './details/details.component';
import { EditComponent } from './edit/edit.component';

const routes: Routes = [
    
    {
        path: 'add',
        component: AddComponent,
        data:{breadcrumb: 'add'},
    },
    {
        path: ':petId',
        children:[
              {
              path:"",
              component: DetailsComponent,
              data:{breadcrumb: 'details'},
              },
              {
                path:"edit",
                component: EditComponent,
                data:{breadcrumb: 'edit'},
              }
          ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class PetRoutingModule {}