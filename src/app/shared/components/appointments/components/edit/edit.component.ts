import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Appointment } from 'app/shared/models/appointment';
import { BusinessHour } from 'app/shared/models/company';
import { Pet } from 'app/shared/models/pet';
import { User } from 'app/shared/models/user';
import { AppointmentService } from 'app/shared/services/appointment.service';
import { CompanyService } from 'app/shared/services/company.service';
import { LoadingService } from 'app/shared/services/loading.service';
import { PetService } from 'app/shared/services/pet.service';
import { UserService } from 'app/shared/services/user.service';
import { getImageUrl } from 'app/shared/utils/image-utils';
import { forkJoin } from 'rxjs';
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
  private _companyService=inject(CompanyService)
  _loadingService = inject(LoadingService);
  appointmentId!: string;
  appointment!: Appointment;
  pets: any[] = [];
  companyBusinessHours: BusinessHour[] = [];
  selectedDate = '';
  selectedTime = '';
  selectedPetId: string = ''; 
  allowedTimes: string[] = [];
    user:User;
  ngOnInit(): void {
  this._loadingService.show();
  this.allowedTimes = this.generateTimes();

  this._route.paramMap.subscribe(params => {
    this.appointmentId = params.get('id')!;
    const companyId = localStorage.getItem("connectedUserCompany");

    forkJoin({
      appointment: this._appointmentService.getAppointment(this.appointmentId),
      company: this._companyService.getOne(companyId!)
    }).subscribe({
      next: ({ appointment, company }) => {
        this.appointment = appointment;
        this.selectedDate = appointment.date.split('T')[0];
        this.selectedTime = appointment.time?.slice(0, 5) || '';
        this.companyBusinessHours = company.businessHours || [];
        this.updateAllowedTimes();

        // Now load user and pets
        this._userService.getOne(appointment.userId._id).subscribe({
          next: (userData) => {
            this.user = userData;
            this.pets = userData.petId
              .filter((pet: any) => !pet.archived)
              .map((pet: any) => ({
                _id: pet._id,
                name: pet.name,
                species: pet.species,
                icon: pet.icon,
              }));
            this.selectedPetId = this.appointment.petId._id;
            this._loadingService.hide();
          },
          error: () => {
            this._loadingService.hide();
          }
        });
      },
      error: () => {
        this._loadingService.hide();
      }
    });
  });
}

  loadAppointment(): void {
    this._appointmentService.getAppointment(this.appointmentId).subscribe({
      next: (response) => {
        this.appointment = response;
        this.selectedDate = response.date.split('T')[0];
        this.selectedTime = response.time?.slice(0, 5) || '';
        this.updateAllowedTimes();
        this._userService.getOne(response.userId._id).subscribe({
          next: (userData) => {
            this.user = userData;
            console.log('userData',userData) ;
            
            this.pets = userData.petId.filter((pet: any) => !pet.archived).map((pet: any) => ({
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
if (!this.isTimeWithinBusinessHours(this.selectedDate, this.selectedTime)) {
    Swal.fire({
      icon: 'error',
      title: 'Invalid Time',
      text: 'The selected time is outside of business hours.',
       confirmButtonColor: '#000000', 
    });
    return;
  }


    if (updatedAppointment.companyId) {
      this._appointmentService.isAvailable(this.selectedDate, this.selectedTime, updatedAppointment.companyId,this.appointment._id).subscribe((res) => {
        if (res.available) {
          console.log('available', res.available);
          
          // Available: proceed with update
          this._appointmentService.updateAppointment(updatedAppointment).subscribe({
            next: () => {
              Swal.fire({
                icon: 'success',
                title: 'Updated!',
                text: 'Appointment updated successfully.',
                timer: 1500,
              }).then(() => {
                this._router.navigate([`../`], { relativeTo: this._route }).then();
              });
            },
            error: (err) => {
              console.error('Update failed', err);
              Swal.fire('Error', 'Could not update appointment', 'error');
            },
          });
        } else {
          console.log('not available', res.available);
          // Not available: show error
          Swal.fire({
            icon: 'error',
            title: 'Unavailable',
            text: 'This time is not available for appointments. Please choose another one.',
          });
        }
      }, (error) => {
        console.error('Error checking availability:', error);
      });
    } else {
      console.error('No companyId found.');
    }
  }

  getCompanyBusinessHours(companyId: string): void {
  this._companyService.getOne(companyId).subscribe({
    next: (company) => {
      this.companyBusinessHours = company.businessHours || [];
      // Now that business hours are loaded, update allowedTimes
      this.updateAllowedTimes();
    },
    error: (err) => {
      console.error('Failed to fetch company business hours:', err);
    }
  });
}

isTimeWithinBusinessHours(date: string, time: string): boolean {
  const datetime = new Date(`${date}T${time}`);
  const dayIndex = datetime.getDay(); // 0 = Sunday

  // Find business hours for that day
  const businessHour = this.companyBusinessHours.find(bh => {
    const dayMap = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6
    };
    return dayMap[bh.day] === dayIndex;
  });

  if (!businessHour) return false;

  // Create Date objects for open and close times
  const openDate = new Date(`${date}T${businessHour.open}`);
  const closeDate = new Date(`${date}T${businessHour.close}`);

  // Now compare actual Date objects
  return datetime >= openDate && datetime <= closeDate;
}


generateTimes(): string[] {
  const times: string[] = [];
  for (let h = 0; h < 24; h++) {
    times.push(`${h.toString().padStart(2, '0')}:00`);
    times.push(`${h.toString().padStart(2, '0')}:30`);
  }
  return times;
}

generateTimesForBusinessHours(date: string): string[] {
  if (!date || !this.companyBusinessHours) return [];
  const dayIndex = new Date(date).getDay();
  const dayMap = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6
  };
  const businessHour = this.companyBusinessHours.find(bh => dayMap[bh.day] === dayIndex);
  if (!businessHour) return [];

  const times: string[] = [];
  const [openHour, openMin] = businessHour.open.split(':').map(Number);
  const [closeHour, closeMin] = businessHour.close.split(':').map(Number);

  let current = new Date(`${date}T${businessHour.open}`);
  const close = new Date(`${date}T${businessHour.close}`);

  while (current <= close) {
    const h = current.getHours().toString().padStart(2, '0');
    const m = current.getMinutes().toString().padStart(2, '0');
    times.push(`${h}:${m}`);
    current.setMinutes(current.getMinutes() + 30);
  }
  return times;
}
updateAllowedTimes() {
  this.allowedTimes = this.generateTimesForBusinessHours(this.selectedDate);
  // Optionally reset selectedTime if it's not in allowedTimes
  if (!this.allowedTimes.includes(this.selectedTime)) {
    this.selectedTime = '';
  }
}

getProductImageUrl(imagePath: string): string {
        const url = getImageUrl(imagePath);
        return url;
      }
}