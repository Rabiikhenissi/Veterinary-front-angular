import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Vet_SERVICES } from 'app/shared/enums/services';
import { LoadingService } from 'app/shared/services/loading.service';
import { MedicalServicesService } from 'app/shared/services/medicalServices.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss'
})
export class EditComponent implements OnInit {
  private _medicalServicesService = inject(MedicalServicesService);
  private _router = inject(Router);
  private _route = inject(ActivatedRoute);
_loadingService = inject(LoadingService);
  serviceId: string = '';
  selectedService: string = '';
  price: number | null = null;

  predefinedServices = Vet_SERVICES;

  ngOnInit(): void {
    this._route.paramMap.subscribe((params) => {
      this.serviceId = params.get('id') || '';
      if (this.serviceId) {
        this.loadServiceDetails();
      }
    });
  }

  loadServiceDetails(): void {
    this._loadingService.show();
    this._medicalServicesService.getOne(this.serviceId).subscribe({
      next: (service: any) => {
        this.selectedService = service.name;
        this.price = service.price;
        this._loadingService.hide();
      },
      error: (err) => {
        console.error('Failed to load service details', err);
        this._loadingService.hide();
      }
    });
  }

  submit(): void {
    if (!this.selectedService || this.price == null) return;

   const updatedService = {
    _id: this.serviceId,
    companyId: localStorage.getItem('connectedUserCompany'),
    name: this.selectedService,
    price: this.price
  };
  this._loadingService.show();
    this._medicalServicesService.updateOne(updatedService).subscribe({
      next: () => {
        this._loadingService.hide();
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Medical Service updated successfully.',
          timer: 1000,
          showConfirmButton: false
        }).then(() => {
          this._loadingService.hide();
          this._router.navigate(['../..'], { relativeTo: this._route });
        });
      },
      error: (err) => {
        console.error('Failed to update service', err);
      }
    });
  }
}
