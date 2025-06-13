import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddComponent } from './add/add.component';
import { DetailsComponent } from './details/details.component';
import { EditComponent } from './edit/edit.component';

const routes: Routes = [
    {
        path: 'add',
        component: AddComponent,
        data: { breadcrumb: 'Add Pet' }, // Only appears when adding
    },
    {
        path: ':id',
        children: [
            {
                path: 'edit',
                component: EditComponent,
                data: { breadcrumb: 'Edit Pet' }, // Appears when editing
            },
            {
                path: '',
                component: DetailsComponent,
                data: { breadcrumb: 'Pet Details' }, // Appears when viewing
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class PetRoutingModule {}