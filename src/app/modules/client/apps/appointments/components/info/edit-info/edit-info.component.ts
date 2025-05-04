import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentService } from 'app/shared/services/appointment.service';
import { PetService } from 'app/shared/services/pet.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-info',
  imports: [CommonModule,FormsModule,MatFormField,MatLabel,MatSelect,MatOption],
  templateUrl: './edit-info.component.html',
  styleUrl: './edit-info.component.scss'
})
export class EditInfoComponent implements OnInit {
  appointmentId: string = '';
  _route = inject(ActivatedRoute);
  _router = inject(Router);
  _appointmentService = inject(AppointmentService);
  _petService = inject(PetService);

  id = this._route.snapshot.paramMap.get('id')!;
  procedureOptions = [
    'Allergy Test',
    'physical Examination',
    'Blood Test',
    'X-Ray',
    'Vaccination',
    'Wound Cleaning',
    'Surgery',
    'Ultrasound'

  ];

  info = {
    symptoms: [] as string[],
    performedProcedures: [],
    weight: null,
    temperature: null,
    heartRate: null,
    nextAppointment: '',
  };

  species: string;

  ngOnInit(): void {
    this._appointmentService.getAppointment(this.id).subscribe({
      next: (appointmentData) => {
        const petId = appointmentData.petId;
        
        this._petService.getOne(petId._id).subscribe({
          next: (petData) => {
            this.species = petData.species;
          },
          error: (error) => {
            console.error('Error fetching pet data:', error);
          }
        });
  
        this.info = {
          symptoms: appointmentData.symptoms || [],
          performedProcedures: appointmentData.performedProcedures || [],
          weight: appointmentData.weight || null,
          temperature: appointmentData.temperature || null,
          heartRate: appointmentData.heartRate || null,
          nextAppointment: appointmentData.nextAppointment || '',
        };
      },
      error: (error) => {
        console.error('Error fetching appointment data:', error);
      }
    });
  }

  onSubmit() {
    console.log('Updated info:', this.info);
    this._appointmentService.updateAppointmentInfo(this.id, this.info).subscribe({
      next: (data) => {
        console.log('Info updated successfully:', data);
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Prescription saved successfully!',
          timer: 1500,
        });       
        console.log('Redirecting to appointment page...',this.id);
        
         this._router.navigate([`../..`], { relativeTo: this._route }).then();
      },
      error: (error) => {
        console.error('Error updating info:', error);
      }
    });
  }
}
