import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Vet_SERVICES } from 'app/shared/enums/services';
import { LoadingService } from 'app/shared/services/loading.service';
import { MedicalServicesService } from 'app/shared/services/medicalServices.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add',
  imports: [FormsModule,CommonModule],
  templateUrl: './add.component.html',
  styleUrl: './add.component.scss'
})
export class AddComponent implements OnInit {
  _medicalServicesService = inject(MedicalServicesService); 
  _router = inject(Router);
  _route = inject(ActivatedRoute);
  _loadingService = inject(LoadingService);
  predefinedServices = Vet_SERVICES;
  selectedService = '';
  price: number | null = null;
  ngOnInit() {
    
  }
submit() {
    if (!this.selectedService || this.price == null) return;
    this._loadingService.show();
console.log('Selected Service:', this.selectedService);
    console.log('Price:', this.price);
    console.log('Company ID:', localStorage.getItem('connectedUserCompany'));
    

    const newService = {
      name: this.selectedService,
      price: this.price,
      companyId: localStorage.getItem('connectedUserCompany') 
      
    };

    this._medicalServicesService.createOne(newService).subscribe({
      next: () => {
        this._loadingService.hide();
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'New Medical Service added successfully.',
          timer: 1000,
          showConfirmButton: false,
        }).then(() => {
          this._router.navigate([`../`], { relativeTo: this._route }).then();
        });
      },
      error: (err) => {
        this._loadingService.hide();
        console.error('Failed to add medical service', err);
      },
    });
  }

}