import { CommonModule } from '@angular/common';
import { Component, inject, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BusinessHour } from 'app/shared/models/company';
import { Pet } from 'app/shared/models/pet';
import { AppointmentService } from 'app/shared/services/appointment.service';
import { CompanyService } from 'app/shared/services/company.service';
import { LoadingService } from 'app/shared/services/loading.service';
import { NotificationService } from 'app/shared/services/notification.service';
import { PetService } from 'app/shared/services/pet.service';
import { UserService } from 'app/shared/services/user.service';
import { getImageUrl } from 'app/shared/utils/image-utils';
import { forkJoin, map, Observable } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add',
  imports: [CommonModule, ReactiveFormsModule,FormsModule,RouterLink],
  templateUrl: './add.component.html',
  styleUrl: './add.component.scss'
})
export class AddComponent implements OnInit {
_route= inject(ActivatedRoute);
_router= inject(Router);
_appointmentService= inject(AppointmentService);
_userService= inject(UserService);
_petService= inject(PetService);
_notificationService = inject(NotificationService); 
_formBuilder= inject(FormBuilder);
 _companyService=inject(CompanyService)
 _loadingService = inject(LoadingService);
  isSubmitted = false;
selectedTime: string = '';
  appointmentForm!: FormGroup;
  clients: any[] = [];
  pets: Pet[] = [];
  selectedClient: any;
  selectedPetId: string | null = null;
   companyId:string
   companyBusinessHours: BusinessHour[] = [];
   outsideBusinessHours = false;
   allowedTimes: string[] = [];
  ngOnInit(): void {
  this._loadingService.show();
  this.allowedTimes = this.generateTimes();
  this.companyId = localStorage.getItem('connectedUserCompany');
  const date = this._route.snapshot.queryParamMap.get('date') || '';
  const time = this._route.snapshot.queryParamMap.get('time') || '';

  if (time) {
    const timeParts = time.split('+')[0];
    this.selectedTime = timeParts ? timeParts.substr(0, 5) : '';
  }

  this.appointmentForm = this._formBuilder.group({
    clientId: ['', Validators.required],
    petId: ['', Validators.required],
    date: [date, Validators.required],
    time: [this.selectedTime, Validators.required],
  });

  // Set allowedTimes initially if date is pre-filled
  this.allowedTimes = this.generateTimesForBusinessHours(this.appointmentForm.value.date);
  this.appointmentForm.get('date')?.valueChanges.subscribe(date => {
    this.onDateChange(date);
  });

  // Use forkJoin to load clients and company business hours in parallel
  forkJoin({
    clients: this._userService.getExternalUsers(this.companyId),
    company: this._companyService.getOne(this.companyId)
  }).subscribe({
    next: ({ clients, company }) => {
      this.clients = clients;
      this.companyBusinessHours = company.businessHours || [];
      // Now that business hours are loaded, generate allowedTimes
      const date = this.appointmentForm?.get('date')?.value || '';
      this.allowedTimes = this.generateTimesForBusinessHours(date);
      this._loadingService.hide();
    },
    error: (err) => {
      this._loadingService.hide();
      console.error('Failed to fetch initial data:', err);
    }
  });
}

  loadClients(): void {
    this._userService.getExternalUsers(this.companyId).subscribe((res: any) => {
      this.clients = res.data;
      console.log('Clients:', this.clients);
      
    });
  }

  onClientSelect(clientId: string): void {
    this.selectedClient = this.clients.find(u => u._id === clientId);
    this.pets = this.selectedClient?.pets || [];
    console.log('Selected client:', this.selectedClient);
    console.log('Pets:', this.pets);
    
        this.selectedPetId = null;
  }

  selectPet(pet: Pet): void {
    this.selectedPetId = pet._id;  
    this.appointmentForm.patchValue({ petId: pet._id }); 
  }

 
  
  submit(): void {
  if (this.appointmentForm.invalid || this.isSubmitted) return;

  const { date, time } = this.appointmentForm.value;

  this.checkAvailableSlot(date, time, null).subscribe((isAvailable) => {
    if (!isAvailable) {
      return; // Stop here if not available
    }

    if (!this.isTimeWithinBusinessHours(date, time)) {
      this.outsideBusinessHours = true;
      Swal.fire({
        icon: 'error',
        title: 'Invalid Time',
        text: 'The selected time is outside of business hours.',
        confirmButtonColor: '#000'
      });
      return;
    }

    this.isSubmitted = true;

    const petId = this.appointmentForm.value.petId;
    const pet = this.pets.find(p => p._id === petId); 
    const petName = pet?.name;
    const petSpecies = pet?.species;

    const companyId = localStorage.getItem('connectedUserCompany');
    const userId = this.selectedClient ? this.selectedClient._id : null;  

    const payload = {
      userId,
      petId,
      companyId,
      date,
      time,
      status: 'confirmed',
    };

    this._appointmentService.createAppointment(payload).subscribe(() => {
      const title = 'Appointment Created';
      const message = `Your appointment for ${petName} (${petSpecies}) has been successfully scheduled.`;
      const type = 'Appointment Created';

      this._notificationService.createNotification({ userId, title, message, type }).subscribe(() => {
        const emailMessage = `A new appointment is scheduled for your pet ${petName} (${petSpecies}) for ${date} at ${time}.`;

        this._notificationService.sendEmailNotification(
          this.selectedClient.email,
          'Appointment Confirmation',
          emailMessage
        ).subscribe(() => {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Appointment added successfully.',
            timer: 1500,
          }).then(() => {
            this._router.navigate([`../`], { relativeTo: this._route }).then();
          });
        }, (error) => {
          console.error('Error sending email:', error);
        });
      });
       // Send SMS
          /*this._notificationService.sendSMSNotification(
            pet.ownerId.phone,
            message
          ).subscribe({
            next: () => console.log('SMS sent'),
            error: err => console.error('SMS failed:', err)
          });*/
    }, (error) => {
      console.error(error);
    });

  });
}


  getCompanyBusinessHours(companyId: string): void {
  this._companyService.getOne(companyId).subscribe({
    next: (company) => {
      this.companyBusinessHours = company.businessHours || [];
      // Now that business hours are loaded, generate allowedTimes
      const date = this.appointmentForm?.get('date')?.value || '';
      this.allowedTimes = this.generateTimesForBusinessHours(date);
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

cancel(): void {
  this._router.navigate(['../'], { relativeTo: this._route });
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
  const dayMap = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6
  };
  const dayIndex = new Date(date).getDay();
  const businessHour = this.companyBusinessHours.find(bh => dayMap[bh.day] === dayIndex);
  if (!businessHour) return [];

  const times: string[] = [];
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

onDateChange(date: string): void {
  this.allowedTimes = this.generateTimesForBusinessHours(date);
  // Optionally reset the time field if the new allowedTimes do not include the current value
  if (!this.allowedTimes.includes(this.appointmentForm.get('time')?.value)) {
    this.appointmentForm.patchValue({ time: '' });
  }
}
 checkAvailableSlot(date: string, time: string, appointmentId: string | null): Observable<boolean> {
  return this._appointmentService.isAvailable(date, time, this.companyId, appointmentId).pipe(
    map(res => {
      if (!res.available) {
        Swal.fire({
          icon: 'warning',
          title: 'Time Unavailable',
          text: 'This time is not available for appointments.',
          confirmButtonColor: '#f87171',
        });
      }
      return res.available;
    })
  );
}
getProductImageUrl(imagePath: string): string {
        const url = getImageUrl(imagePath);
        return url;
      }
}
