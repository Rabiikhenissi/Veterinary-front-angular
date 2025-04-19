import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs';
interface Breadcrumb {
  label: string;
  url: string;
}
@Component({
  selector: 'app-breadcrumbs',
  imports: [CommonModule,RouterModule],
  templateUrl: './breadcrumbs.component.html',
  styleUrl: './breadcrumbs.component.scss'
})
export class BreadcrumbsComponent implements OnInit {
  breadcrumbs: Breadcrumb[] = [];

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.breadcrumbs = this.buildBreadcrumbs(this.route.root);
    });
  }

  buildBreadcrumbs(route: ActivatedRoute, url: string = '', breadcrumbs: Breadcrumb[] = []): Breadcrumb[] {
    if (route.routeConfig && route.routeConfig.path !== null) { // Ensure path is not null
      const routeURL = route.routeConfig.path;
      url += `/${routeURL.replace(/:.*$/, '')}`; // Remove route parameter (e.g., :id)
  
      const label = route.snapshot.data['breadcrumb'];
      
      // Check if the breadcrumb label already exists to prevent duplicates
      if (label && !breadcrumbs.some(b => b.label === label)) {
        breadcrumbs.push({ label, url });
      }
    }
  
    // Recursively process child routes
    if (route.firstChild) {
      return this.buildBreadcrumbs(route.firstChild, url, breadcrumbs);
    }
  
    return breadcrumbs;
  }
  
  
}