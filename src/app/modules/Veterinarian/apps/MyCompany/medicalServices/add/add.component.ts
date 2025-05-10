import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Vet_SERVICES } from 'app/shared/enums/services';
import { CompanyService } from 'app/shared/services/company.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add',
  imports: [FormsModule,CommonModule],
  templateUrl: './add.component.html',
  styleUrl: './add.component.scss'
})
export class AddComponent implements OnInit {
  _companyService = inject(CompanyService);
  _router = inject(Router);
  _route = inject(ActivatedRoute);
  predefinedServices = Vet_SERVICES;
  selectedService = '';
  price: number | null = null;
  company: any;
  ngOnInit() {
    this._companyService.getOne(localStorage.getItem('connectedUserCompany')).subscribe({
      next: (companyData) => {
        this.company = companyData;
      },
      error: (err) => {
        console.error('Failed to fetch company', err);
      },
    });
  }

  submit() {
    if (!this.selectedService || this.price == null) return;
    const newService = {
      name: this.selectedService,
      price: this.price,
    };
    this.company.services.push(newService);
    this._companyService.updateOne(this.company).subscribe({
      next: () => {
Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'New Medical Service added successfully.',
                      timer: 1000,
                      showConfirmButton: false,
                  }).then(() => {
                    this._router.navigate([`../`], { relativeTo: this._route }).then();        });      },      error: (err) => {
        console.error('Failed to add service', err);
      },
    });
  }
}