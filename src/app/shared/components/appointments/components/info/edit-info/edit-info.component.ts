import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentService } from 'app/shared/services/appointment.service';
import { LoadingService } from 'app/shared/services/loading.service';
import { MedicalServicesService } from 'app/shared/services/medicalServices.service';
import { PetService } from 'app/shared/services/pet.service';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-info',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormField, MatLabel, MatSelect, MatOption],
  templateUrl: './edit-info.component.html',
  styleUrls: ['./edit-info.component.scss']
})
export class EditInfoComponent implements OnInit {
  appointmentId: string = '';
  _route = inject(ActivatedRoute);
  _router = inject(Router);
  _appointmentService = inject(AppointmentService);
  _petService = inject(PetService);
  _medicalServicesService = inject(MedicalServicesService);
  id = this._route.snapshot.paramMap.get('id')!;
  _loadingService = inject(LoadingService);
  services: any[] = [];
  selectedProcedures: any[] = [];

  info = {
    symptoms: '',  // Symptoms as comma-separated string for input binding
    performedProcedures: [] as { name: string, price: number }[],
    weight: null as number | null,
    temperature: null as number | null,
    heartRate: null as number | null,
    nextAppointment: '',
  };

  species: string = '';

  ngOnInit(): void {
  this._loadingService.show();

  // Load services and appointment in parallel
  forkJoin({
    services: this._medicalServicesService.getAll(localStorage.getItem('connectedUserCompany') || ''),
    appointment: this._appointmentService.getAppointment(this.id)
  }).subscribe({
    next: ({ services, appointment }) => {
      this.services = services.data;

      // Convert symptoms array to comma-separated string
      this.info = {
        symptoms: Array.isArray(appointment.symptoms) ? appointment.symptoms.join(', ') : '',
        performedProcedures: Array.isArray(appointment.performedProcedures)
          ? appointment.performedProcedures.map((proc: any) =>
              typeof proc === 'string'
                ? { name: proc, price: 0 }
                : proc
            )
          : [],
        weight: appointment.weight || null,
        temperature: appointment.temperature || null,
        heartRate: appointment.heartRate || null,
        nextAppointment: appointment.nextAppointment || '',
      };

      // Select performedProcedures in UI select
      this.selectedProcedures = this.services.filter(service =>
        this.info.performedProcedures.some(proc => proc.name === service.name)
      );

      // Now load pet data
      const petId = appointment.petId;
      this._petService.getOne(petId._id).subscribe({
        next: (petData) => {
          this.species = petData.species;
          this._loadingService.hide();
        },
        error: (error) => {
          this._loadingService.hide();
          console.error('Error fetching pet data:', error);
        }
      });
    },
    error: (err) => {
      this._loadingService.hide();
      console.error('Failed to load services or appointment:', err);
    }
  });
}

  onProceduresChange(selected: any[]) {
    this.selectedProcedures = selected;  // Keep UI in sync
    this.info.performedProcedures = selected.map(service => ({
      name: service.name,
      price: service.price
    }));
  }

  onSubmit() {
    // Convert symptoms string back to array before sending
    const symptomsArray = typeof this.info.symptoms === 'string'
      ? this.info.symptoms.split(',').map(s => s.trim()).filter(s => s)
      : [];
    this.info.symptoms = symptomsArray as any; // Cast to any to satisfy type, or update type if needed

    console.log('Updated info:', this.info);
    this._loadingService.show();
    this._appointmentService.updateAppointmentInfo(this.id, this.info).subscribe({
      next: (data) => {
        this._loadingService.hide();
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Prescription saved successfully!',
          timer: 1500,
        });
        this._router.navigate(['../..'], { relativeTo: this._route }).then();
      },
      error: (error) => {
        this._loadingService.hide();
        console.error('Error updating info:', error);
      }
    });
  }
}
