import { CommonModule } from '@angular/common';
import { Component, inject, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Pet } from 'app/shared/models/pet';
import { AppointmentService } from 'app/shared/services/appointment.service';
import { PetService } from 'app/shared/services/pet.service';
import { UserService } from 'app/shared/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add',
  imports: [CommonModule, ReactiveFormsModule,FormsModule],
  templateUrl: './add.component.html',
  styleUrl: './add.component.scss'
})
export class AddComponent implements OnInit {
_route= inject(ActivatedRoute);
_router= inject(Router);
_appointmentService= inject(AppointmentService);
_userService= inject(UserService);
_petService= inject(PetService);
_formBuilder= inject(FormBuilder);
selectedTime: string = '';
  appointmentForm!: FormGroup;
  clients: any[] = [];
  pets: Pet[] = [];
  selectedClient: any;
  selectedPetId: string | null = null;
  ngOnInit(): void {
    const date = this._route.snapshot.queryParamMap.get('date') || '';
    const time = this._route.snapshot.queryParamMap.get('time') || '';

  if (time) {
    const timeParts = time.split('+')[0]; 
    this.selectedTime = timeParts ? timeParts.substr(0, 5) : ''; 
  } 

  console.log('Selected time:', this.selectedTime);

        
    this.appointmentForm = this._formBuilder.group({
      clientId: ['', Validators.required],
      petId: ['', Validators.required],
      date: [date, Validators.required],
      time: [this.selectedTime, Validators.required],    });

    this.loadClients();
  }

  loadClients(): void {
    this._userService.getExternalUsers().subscribe((res: any) => {
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
    if (this.appointmentForm.invalid) return;

    console.log('Form values:', this.appointmentForm.value);

    const petId = this.appointmentForm.value.petId;
    console.log('Selected pet ID:', petId);

    const companyId = localStorage.getItem('connectedUserCompany');
    
    const userId = this.selectedClient ? this.selectedClient._id : null;  

    const payload = {
      userId,
      petId,
      companyId,
      date: this.appointmentForm.value.date,
      time: this.appointmentForm.value.time,
      status: 'pending',
    };

    console.log('Payload:', payload);

    this._appointmentService.createAppointment(payload).subscribe(() => {
      Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Appointment added successfully.',
                  timer: 1500,
              }).then(() => {
                this._router.navigate([`../`], { relativeTo: this._route }).then();        });
    }, (error) => {
      
      console.error(error);
    });
  }
}