import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Company } from 'app/shared/models/company';
import { CompanyService } from 'app/shared/services/company.service';

@Component({
    selector: 'landing-home',
    templateUrl: './home.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [MatButtonModule,CommonModule, MatIconModule,RouterLink]
})
export class LandingHomeComponent implements OnInit {
    _router = inject(Router);
    _route = inject(ActivatedRoute);
  companies: Company[] = [];
  defaultLogo = 'assets/images/logo/logo.svg';

  constructor(private companyService: CompanyService) {}

  ngOnInit(): void {
    this.companyService.getAll().subscribe({
      next: (res) => {
        this.companies = res.data;
      },
      error: (err) => {
        console.error('Failed to fetch companies ', err);
      },
    });
  }

    details(company: Company) {
this._router.navigate([`/company-details/${company._id}`]);  }
}