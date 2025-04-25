import { F } from '@angular/cdk/keycodes';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentService } from 'app/shared/services/appointment.service';
import { PetService } from 'app/shared/services/pet.service';
import { ProductService } from 'app/shared/services/product.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-info',
  imports: [CommonModule,FormsModule],
  templateUrl: './add-info.component.html',
  styleUrl: './add-info.component.scss'
})
export class AddInfoComponent implements OnInit {
  appointmentId: string = '';
  _route=inject(ActivatedRoute);
  _router=inject(Router);
  _productService=inject(ProductService);
  _appointmentService=inject(AppointmentService);
  _petService=inject(PetService);
  id = this._route.snapshot.paramMap.get('id')!;
 
  procedureOptions = [
    'Blood Test',
    'X-Ray',
    'Vaccination',
    'Wound Cleaning',
    'Surgery',
    'Ultrasound'
  ];

  info = {
    symptoms:  [] as string[],
    performedProcedures: [],
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
  }
  handleSymptomsInput(symptomInput: string) {
    const symptomsArray = symptomInput.split(',').map(symptom => symptom.trim());
    this.info.symptoms = [...this.info.symptoms, ...symptomsArray];
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