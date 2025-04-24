import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { AppointmentService } from 'app/shared/services/appointment.service';
import { PetService } from 'app/shared/services/pet.service';
import { PrescriptionService } from 'app/shared/services/prescription.service';
import { ProductService } from 'app/shared/services/product.service';

@Component({
  selector: 'app-prescription',
  imports: [CommonModule,FormsModule],
  templateUrl: './prescription.component.html',
  styleUrl: './prescription.component.scss'
})
export class PrescriptionComponent implements OnInit {
  appointmentId!: string;
  appointment: any;
  medications: any[] = [];
  selectedMedications: any[] = [];
_route = inject(ActivatedRoute);
  _appointmentService = inject(AppointmentService);
  _prescriptionService = inject(PrescriptionService);
  _sanitizer = inject(DomSanitizer);
_productService = inject(ProductService);
_petService = inject(PetService);
id = this._route.snapshot.paramMap.get('id')!;

species: string;
medication: any[] = [];
ngOnInit(): void {
  // get Appointment
  this._appointmentService.getAppointment(this.id).subscribe({
    next: (appointmentData) => {
      this.appointment = appointmentData;
      const petId = appointmentData.petId;
      this._petService.getOne(petId._id).subscribe({
        next: (petData) => {
          this.species = petData.species;
          console.log('Species:', this.species);
          //fetch medications based on species 
            this._productService.getList('100', '1', '', 'Medications', this.species).subscribe({
            next: (res) => {
              console.log('Medications for', this.species, ':', res.data);
              this.medication = res.data;  
            },
            error: (err) => {
              console.error('Error loading medications:', err);
            }
          });
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


selectMedication(medication: any) {
  if (medication && medication._id) {
    const index = this.selectedMedications.indexOf(medication);
    if (index > -1) {
      this.selectedMedications.splice(index, 1);
    } else {
      this.selectedMedications.push(medication); 
    }
  }
}

loadAppointment(id: string): void {
    this._appointmentService.getAppointment(id).subscribe({
      next: (appointmentData) => {
        const petId = appointmentData.petId;
        this._petService.getOne(petId._id).subscribe({
          next: (petData) => {
            this.species = petData.species;
            console.log('Species:', this.species);
            //fetch medications based on species 
              this._productService.getList('100', '1', '', 'Medications', this.species).subscribe({
              next: (res) => {
                console.log('Medications for', this.species, ':', res.data);
                this.medication = res.data;  
              },
              error: (err) => {
                console.error('Error loading medications:', err);
              }
            });
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



savePrescription(): void {
  // Construct the prescription data with selected medications
  const medications = this.selectedMedications.map((med) => ({
    productId: med._id,
    dosage: med.dosage,
    instructions: med.instructions,
  }));
  const prescription = {
    appointmentId: this.id,
    userId: this.appointment.userId._id,
    petId: this.appointment.petId._id,
    companyId: this.appointment.companyId,
    medications: medications,
  };
console.log('Prescription:', prescription);

  // Call the service to save the prescription
  this._prescriptionService.createPrescription(prescription).subscribe({
    next: (res) => {
      console.log('Prescription saved:', res);
      alert('Prescription saved successfully!');
      const prescriptionId = res._id;
      this.generatePDF(prescriptionId);
    },
    error: (err) => {
      console.error('Error saving prescription:', err);
      alert('Something went wrong while saving the prescription.');
    },
  });
}

  generatePDF(id): void {
    this._prescriptionService.generatePrescriptionPDF(id).subscribe({
      next: (res: Blob) => {
        const url = window.URL.createObjectURL(res);
        window.open(url);
      },
      error: (err) => {
        console.error('Failed to fetch PDF:', err);
        alert('Unable to load PDF');
      },
    });
  }
}