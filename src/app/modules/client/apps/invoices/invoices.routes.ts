import { Routes } from "@angular/router";
import { InvoicesComponent } from "./invoices.component";
import { FeatureCodes } from "app/shared/enums/feature-codes";
import { FeatureActions } from "app/shared/enums/feature-actions";


export default [
  {
    path: '',
    component:InvoicesComponent,
    data: {
        breadcrumb: 'Invoices',
        
        },
  },
 
] as Routes;