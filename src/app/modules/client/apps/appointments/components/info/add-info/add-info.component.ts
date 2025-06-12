import { F } from '@angular/cdk/keycodes';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentService } from 'app/shared/services/appointment.service';
import { CompanyService } from 'app/shared/services/company.service';
import { LoadingService } from 'app/shared/services/loading.service';
import { MedicalServicesService } from 'app/shared/services/medicalServices.service';
import { PetService } from 'app/shared/services/pet.service';
import { ProductService } from 'app/shared/services/product.service';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-info',
  imports: [CommonModule,FormsModule,MatFormField,MatLabel,MatSelect,MatOption],
  templateUrl: './add-info.component.html',
  styleUrl: './add-info.component.scss'
})
export class AddInfoComponent implements OnInit {
  appointmentId: string = '';
  _route=inject(ActivatedRoute);
  _router=inject(Router);
  _productService=inject(ProductService);
  _appointmentService=inject(AppointmentService);
  _companyService=inject(CompanyService);
  _petService=inject(PetService);
  _medicalServicesService=inject(MedicalServicesService);
  _loadingService = inject(LoadingService);
  id = this._route.snapshot.paramMap.get('id')!;
 services: any[] = [];
  info = {
    symptoms:  [] as string[],
performedProcedures: [] as { name: string, price: number }[],
    weight: null,
    temperature: null,
    heartRate: null,
    nextAppointment: '',
  };
  species: string;
selectedProcedures: any[] = [];

  ngOnInit(): void {
  this._loadingService.show();

  // Get appointment, then use its petId for the pet request
  this._appointmentService.getAppointment(this.id).subscribe({
    next: (appointmentData) => {
      const petId = appointmentData.petId._id;
      forkJoin({
        pet: this._petService.getOne(petId),
        services: this._medicalServicesService.getAll(localStorage.getItem('connectedUserCompany'))
      }).subscribe({
        next: ({ pet, services }) => {
          this.species = pet.species;
          this.services = services.data;
          this._loadingService.hide();
          
        },
        error: (error) => {
          this._loadingService.hide();
          console.error('Error fetching pet or services:', error);
        }
      });
    },
    error: (error) => {
      this._loadingService.hide();
      console.error('Error fetching appointment data:', error);
    }
  });
}
  
  handleSymptomsInput(symptomInput: string) {
    const symptomsArray = symptomInput.split(',').map(symptom => symptom.trim());
    this.info.symptoms = [...this.info.symptoms, ...symptomsArray];
  }


    onProceduresChange(selected: any[]) {
      this.selectedProcedures = selected;  // Keep UI in sync
    this.info.performedProcedures = selected.map(service => ({
      name: service.name,
      price: service.price
    }));
  }
  onSubmit() {
  this._loadingService.show();
    this._appointmentService.addAppointmentInfo(this.id, this.info).subscribe({
      next: (data) => {
        this._loadingService.hide();
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Appointment info added successfully!',
          timer: 1000,
        });        this._router.navigate([`../`], { relativeTo: this._route }).then();  
      },
      error: (error) => {
        this._loadingService.hide();
        console.error('Error adding info:', error);
      }
    });
  }
}