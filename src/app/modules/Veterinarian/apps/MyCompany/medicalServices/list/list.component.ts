import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CompanyService } from 'app/shared/services/company.service';

@Component({
  selector: 'app-list',
  imports: [FormsModule,CommonModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit {
  _companyService= inject(CompanyService);
  _router = inject(Router);
  _route = inject(ActivatedRoute);
  services: any[] = [];
  companyName:string;

  ngOnInit() {
    this._companyService.getOne(localStorage.getItem('connectedUserCompany')).subscribe({
      next: (company) => {
        this.services = company.services;
        this.companyName=company.name
      },
      error: (error) => {
        console.error('Error fetching company data:', error);
      }
    }
    );
  }
   add() {
    this._router.navigate([`add`], { relativeTo: this._route });
  }
   editService(service: any) {
    console.log('service',service) ;
    console.log('serviceId',service._id) ;
    this._router.navigate([`${service._id}/edit`], { relativeTo: this._route }).then();
  }   
 
}