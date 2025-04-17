import { Route } from "@angular/router";
import { ShopComponent } from "./shop.component";
import { ViewComponent } from "./view/view.component";

export default [
  {
    path: '',
    component:ShopComponent,
    data: {
        breadcrumb: 'Shop',
        },
  },
  {
    path:':id',
    component:ViewComponent,
    data: {
        breadcrumb: 'Product',
        },
  }
] as Route[];