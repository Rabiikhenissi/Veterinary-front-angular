import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Vet_SERVICES } from 'app/shared/enums/services';
import { CompanyService } from 'app/shared/services/company.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit',
  imports: [FormsModule, CommonModule],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss'
})
export class EditComponent implements OnInit {
  _companyService = inject(CompanyService);
  _router = inject(Router);
  _route = inject(ActivatedRoute);

  serviceId: string = '';
  selectedService: string = '';
  price: number | null = null;

  company: any; 

  ngOnInit(): void {
    this._route.paramMap.subscribe((params) => {
      this.serviceId = params.get('id') || ''; 
      this.loadServiceDetails();
    });
  }

  loadServiceDetails(): void {
    this._companyService.getOne(localStorage.getItem('connectedUserCompany')).subscribe((company) => {
      this.company = company; 
      const service = company.services.find((service: any) => service._id === this.serviceId);
      if (service) {
        this.selectedService = service.name;
        this.price = service.price;
      }
    });
  }

  submit(): void {
    if (!this.selectedService || this.price == null) return;
    const updatedService = {
      name: this.selectedService,
      price: this.price,
    };
    const updatedServices = this.company.services.map((service: any) => {
      if (service._id === this.serviceId) {
        return { ...service, ...updatedService };
      }
      return service;
    });
    const updatedCompany = { ...this.company, services: updatedServices };
    this._companyService.updateOne(updatedCompany).subscribe({
      next: () => {
           Swal.fire({
                                    icon: 'success',
                                    title: 'Success!',
                                    text: 'Medical Service updated successfully.',
                                      timer: 1000,
                                      showConfirmButton: false,
                                  }).then(() => {
                                    this._router.navigate([`../..`], { relativeTo: this._route }).then();        });
              },
      error: (err) => {
        console.error('Failed to update service', err);
      },
    });
  }
}