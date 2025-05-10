import { F } from '@angular/cdk/keycodes';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentService } from 'app/shared/services/appointment.service';
import { CompanyService } from 'app/shared/services/company.service';
import { PetService } from 'app/shared/services/pet.service';
import { ProductService } from 'app/shared/services/product.service';
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


  ngOnInit(): void {
    // get Appointment
    this._appointmentService.getAppointment(this.id).subscribe({
      next: (appointmentData) => {
        //get pet to get the species
        const petId = appointmentData.petId;
        this._petService.getOne(petId._id).subscribe({
          next: (petData) => {
            this.species = petData.species;
            console.log('Species:', this.species);
          },
          error: (error) => {
            console.error('Error fetching pet data:', error);
          }
        });
      },
      error: (error) => {
        console.error('Error fetching appointment data:', error);
      }
    });
 this._companyService.getOne(localStorage.getItem('connectedUserCompany')).subscribe({
      next: (company) => {
        this.services = company.services;
      },
      error: (err) => console.error('Failed to load services:', err)
    });
  } 
  
  handleSymptomsInput(symptomInput: string) {
    const symptomsArray = symptomInput.split(',').map(symptom => symptom.trim());
    this.info.symptoms = [...this.info.symptoms, ...symptomsArray];
  }


    onProceduresChange(selected: any[]) {
    this.info.performedProcedures = selected.map(service => ({
      name: service.name,
      price: service.price
    }));
  }
  onSubmit() {
  console.log('Submitted info:', this.info);
    this._appointmentService.addAppointmentInfo(this.id, this.info).subscribe({
      next: (data) => {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Appointment info added successfully!',
          timer: 1500,
        });        this._router.navigate([`../`], { relativeTo: this._route }).then();  
      },
      error: (error) => {
        console.error('Error adding info:', error);
      }
    });
  }
}