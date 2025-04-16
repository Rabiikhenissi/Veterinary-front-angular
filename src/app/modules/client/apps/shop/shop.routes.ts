import { Route } from "@angular/router";
import { ShopComponent } from "./shop.component";

export default [
  {
    path: '',
    component:ShopComponent,
    data: {
        breadcrumb: 'Shop',
        },
  },
] as Route[];