import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentService } from 'app/shared/services/appointment.service';
import { LoadingService } from 'app/shared/services/loading.service';
import { PetService } from 'app/shared/services/pet.service';
import { PrescriptionService } from 'app/shared/services/prescription.service';
import { ProductService } from 'app/shared/services/product.service';
import { getImageUrl } from 'app/shared/utils/image-utils';
import Swal from 'sweetalert2';

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
  _router = inject(Router);
_route = inject(ActivatedRoute);
  _appointmentService = inject(AppointmentService);
  _prescriptionService = inject(PrescriptionService);
  _sanitizer = inject(DomSanitizer);
_productService = inject(ProductService);
_petService = inject(PetService);
id = this._route.snapshot.paramMap.get('id')!;
_loadingService = inject(LoadingService);
species: string;
medication: any[] = [];
ngOnInit(): void {
  this._loadingService.show();
  this._appointmentService.getAppointment(this.id).subscribe({
    next: (appointmentData) => {
      this.appointment = appointmentData;
      const petId = appointmentData.petId;
      // Use forkJoin to fetch pet and medications in parallel after getting pet data
      this._petService.getOne(petId._id).subscribe({
        next: (petData) => {
          this.species = petData.species;
          console.log('Species:', this.species);
          // Fetch medications based on species
          this._productService.getList('100', '1', '', 'Medications', this.species).subscribe({
            next: (res) => {
              console.log('Medications for', this.species, ':', res.data);
              this.medication = res.data;
              this._loadingService.hide();
            },
            error: (err) => {
              this._loadingService.hide();
              console.error('Error loading medications:', err);
            }
          });
        },
        error: (error) => {
          this._loadingService.hide();
          console.error('Error fetching pet data:', error);
        }
      });
    },
    error: (error) => {
      this._loadingService.hide();
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
  if (this.selectedMedications.length === 0) {
    Swal.fire({
      icon: 'warning',
      title: 'No Medications Selected',
      text: 'Please select at least one medication to prescribe.',
      timer: 1500,
    });
    return;
  }   for (const med of this.selectedMedications) {
    if (!med.dosage || !med.instructions) {
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Medication Info',
        text: 'Please fill in both dosage and instructions for all selected medications.',
        timer: 1500,
      });
      return;
    }
  }


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

  this._prescriptionService.createPrescription(prescription).subscribe({
    next: (res) => {
      console.log('Prescription saved:', res);
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Prescription saved successfully!',
        timer: 1500,
        
      });      
      const prescriptionId = res._id;
      this.generatePDF(prescriptionId);
      this._router.navigate([`../`], { relativeTo: this._route }).then(); 

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
        Swal.fire({
          icon: 'error',
          title: 'Failed to fetch PDF',
          text: 'Unable to load the prescription PDF.',
          timer: 1500,
          
        });      },
    });
  }
getProductImageUrl(imagePath: string): string {
  const url = getImageUrl(imagePath);
    return url;
}
  isPrescriptionInvalid(): boolean {
  return (
    this.selectedMedications.length === 0 ||
    this.selectedMedications.some((med: any) => !med.dosage || !med.instructions)
  );
}
}

