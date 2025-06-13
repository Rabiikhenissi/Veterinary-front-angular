import { Route } from "@angular/router";
import { ListComponent } from "./list/list.component";
import { AddComponent } from "./add/add.component";
import { DetailsComponent } from "./list/components/details/details.component";
import { EditComponent } from "./list/components/edit/edit.component";

export default  [
  {
    path: '',
    children: [
      {
        path: '',
        component: ListComponent,
       
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