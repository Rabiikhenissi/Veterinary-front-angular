import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Appointment } from 'app/shared/models/appointment';
import { Pet } from 'app/shared/models/pet';
import { User } from 'app/shared/models/user';
import { AppointmentService } from 'app/shared/services/appointment.service';
import { PetService } from 'app/shared/services/pet.service';
import { UserService } from 'app/shared/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit',
  imports: [CommonModule,FormsModule],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss'
})
export class EditComponent implements OnInit {
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);
  private _appointmentService = inject(AppointmentService);
  private _petService = inject(PetService);
  private _userService = inject(UserService);
  appointmentId!: string;
  appointment!: Appointment;
  pets: any[] = [];
  
  selectedDate = '';
  selectedTime = '';
  selectedPetId: string = ''; 
    user:User;
  ngOnInit(): void {
    this._route.paramMap.subscribe(params => {
      this.appointmentId = params.get('id')!;
      this.loadAppointment();
    });
  }

  loadAppointment(): void {
    this._appointmentService.getAppointment(this.appointmentId).subscribe({
      next: (response) => {
        this.appointment = response;
        this.selectedDate = response.date.split('T')[0];
        this.selectedTime = response.time?.slice(0, 5) || '';
        
        this._userService.getOne(response.userId._id).subscribe({
          next: (userData) => {
            this.user = userData;
            console.log('userData',userData) ;
            
            this.pets = userData.petId.map((pet: any) => ({
              _id: pet._id,
              name: pet.name,
              species: pet.species,
              icon: pet.icon,
            }));
           
              this.selectedPetId = this.appointment.petId._id;
            
          },
          error: () => console.error('Error loading user data'),
        });
      },
      error: (err) => console.error('Error loading appointment', err),
    });
  }

  selectPet(pet: any): void {
    this.selectedPetId = pet._id; 
  }
  

  updateAppointment(): void {
    
    const updatedAppointment = {
      ...this.appointment,
      date: this.selectedDate,
      time: this.selectedTime,
      petId: this.selectedPetId,
      userId: this.appointment.userId._id,
      companyId: this.appointment.companyId
    };

    this._appointmentService.updateAppointment(updatedAppointment).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Appointment updated successfully.',
            timer: 1500,
        }).then(() => {
          this._router.navigate([`../`], { relativeTo: this._route }).then();        });
      },
      error: (err) => {
        console.error('Update failed', err);
        Swal.fire('Error', 'Could not update appointment', 'error');
      },
    });
  }
}