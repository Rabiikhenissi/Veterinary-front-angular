import { Routes } from "@angular/router";
import { InvoicesComponent } from "./invoices.component";


export default [
  {
    path: '',
    component:InvoicesComponent,
    data: {
        breadcrumb: 'Invoices',
        },
  },
 
] as Routes;