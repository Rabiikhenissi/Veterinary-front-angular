import { R } from '@angular/cdk/keycodes';
import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Appointment } from 'app/shared/models/appointment';
import { Pet } from 'app/shared/models/pet';
import { AppointmentService } from 'app/shared/services/appointment.service';
import { LoadingService } from 'app/shared/services/loading.service';
import { PetService } from 'app/shared/services/pet.service';
import { FeatureCodes } from 'app/shared/enums/feature-codes';
import { FeatureActions } from 'app/shared/enums/feature-actions';
import { FeaturesDirective } from 'app/shared/directives/features.directive';
import { ProductService } from 'app/shared/services/product.service';
import { PrescriptionService } from 'app/shared/services/prescription.service';
import { UserService } from 'app/shared/services/user.service';
import { User } from 'app/shared/models/user';
@Component({
  selector: 'app-details',
  imports: [CommonModule,DatePipe,FeaturesDirective],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss'
})
export class DetailsComponent implements OnInit {
  _loadingService = inject(LoadingService);
  _appointmentService = inject(AppointmentService);
  _prescriptionService = inject(PrescriptionService);
  _userService = inject(UserService);
  _petService = inject(PetService);
  _productService = inject(ProductService);
  _route = inject(ActivatedRoute);
  _router = inject(Router);
      _fuseConfirmationService= inject(FuseConfirmationService);
      featureCodes = FeatureCodes;
      featureActions = FeatureActions;
  id = this._route.snapshot.paramMap.get('id')!;
  appointment!: Appointment;
  pet:Pet;
  medications: any[] = [];
  userRole:string
  ngOnInit(): void {
    const userId=localStorage.getItem('connectedUserId')
    console.log('userId',userId) ;
    this._userService.getOne(userId!).subscribe({
      next: (userData) => {
        console.log('userData',userData) ;
        this.userRole=userData.groupsId.code;
        console.log('userRole',this.userRole) ;
      },
      error: () => console.error('Failed to fetch user data')
    });
    this._loadingService.show();
    this._appointmentService.getAppointment(this.id).subscribe({
      next: (data) => {
        this.appointment = data;
        this._loadingService.hide();
        console.log('petId',this.appointment.petId._id) ;
        console.log(this.appointment);
        
        this._petService.getOne(this.appointment.petId._id).subscribe({
          next: (petData) => {
            this.pet = petData;
            this._loadingService.hide();
          },
        error: () => this._loadingService.hide()
        });
        
        if (this.appointment.medications?.length > 0) {
          this.appointment.medications.forEach((medicationId) => {
            this._productService.getOne(medicationId).subscribe({
              next: (medicationData) => {
                this.medications.push(medicationData);
              },
              error: () => console.error('Failed to fetch medication data')
            });
          });
        }
      },
      error: () => this._loadingService.hide()
    });
  }
  getFormattedTime(time: string): string {
    const dateTime = new Date(`2025-04-08T${time}`); 
    return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).format(dateTime);
  }
  confirmAppointment(): void {
    this.appointment.status = 'confirmed';
    const updatedAppointment = {
      ...this.appointment,
      companyId: this.appointment.companyId,
      userId: this.appointment.userId._id, 
      petId: this.appointment.petId._id    
    };
    console.log('Updated Appointment:', updatedAppointment);
    this._appointmentService.updateAppointment(updatedAppointment).subscribe({
      next: () => {
        this._loadingService.hide();
      },
      error: () => {
        this._loadingService.hide();
      }
    });
  }
  cancelAppointment(): void {
    this._loadingService.show();
          const confirmation = this._fuseConfirmationService.open({
        title: 'Cancel Appointment',
        message: 'Would you like to confirm the cancel ?',
        actions: {
            confirm: {
                label: 'yes',
            },
            cancel: {
                label: 'no',
            },
        },
    });

    confirmation.afterClosed().subscribe((result) => {
        if (result === 'confirmed') {
          this._appointmentService.archiveAppointment(this.appointment._id!).subscribe({
            next: () => {
              this._loadingService.hide();
              this._router.navigate([`../`], { relativeTo: this._route }).then();
            },
            error: (error) => {
              this._loadingService.hide();
              console.error('Archive Error:', error);
            }
          });
        }
    });
  }
 editAppointment(): void {
  this._router.navigate([`/home/calendar/${this.appointment._id}/edit`]).then();
 }
 addAppointmentInfo(): void {
  this._router.navigate(['info'], { relativeTo: this._route }).then(); 
 }
 editAppointmentInfo(): void {
  this._router.navigate(['info/edit'], { relativeTo: this._route }).then(); 
 }
 addPrescription(): void {
  this._router.navigate(['prescription'], { relativeTo: this._route }).then(); 
 }
 
}
