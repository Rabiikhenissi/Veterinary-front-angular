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
import Swal from 'sweetalert2';
import { NotificationService } from 'app/shared/services/notification.service';
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
  _notificationService = inject(NotificationService);
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
  userRole: string = '';
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
    let user: User;
  this._userService.getOne(this.appointment.userId._id).subscribe({
      next: (userData) => {
        user = userData;
        console.log('user',user) ;
      },
      error: () => console.error('Failed to fetch user data')
    });


    console.log('Updated Appointment:', updatedAppointment);
      this._appointmentService.updateAppointment(updatedAppointment).subscribe({
      next: () => {
        const title = 'Appointment Confirmed';
        const message = `Your appointment for ${this.appointment.petId.name} (${this.appointment.petId.species}) has been successfully scheduled for ${this.appointment.date} at ${this.appointment.time}.`;
        const type = 'Appointment Confirmation';
  
        console.log('Notification Payload:', { userId: this.appointment.userId._id, title, message, type });
  
        // Create notification
        this._notificationService.createNotification({
          userId: this.appointment.userId._id,
          title,
          message,
          type
        }).subscribe(() => {
          console.log('Notification sent successfully.');
  
          // Send Email Notification
          const emailMessage = `A new appointment is scheduled for your pet ${this.appointment.petId.name} (${this.appointment.petId.species}) for ${this.appointment.date} at ${this.appointment.time}.`;
  
          this._notificationService.sendEmailNotification(
            user.email,
            'Appointment Confirmation',
            emailMessage
          ).subscribe({
            next: () => {
              Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Appointment confirmed successfully.',
                timer: 1500,
              }).then(() => {
              });
            },
            error: (error) => {
              console.error('Error sending email:', error);
              Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Something went wrong while sending the email notification.',
              });
            }
          });
        }, (error) => {
          console.error('Error sending notification:', error);
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something went wrong while sending the notification.',
          });
        });
      },
      error: (err) => {
        console.error('Error confirming appointment:', err);
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Something went wrong while confirming the appointment.',
        });
      }
    });
  
    this._loadingService.hide();
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
  PrescriptionPdf(): void {
    this._appointmentService.getPrescriptionPdf(this.appointment.prescriptionId).subscribe(
      (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      },
      (error) => {
        console.error('Error fetching prescription PDF', error);
      }
    );
  }
 editAppointment(): void {
  this._router.navigate([`/home/appointments/${this.appointment._id}/edit`]).then();
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
 addInfo(): boolean {
  if (!this.appointment?.date || !this.appointment?.time) {
    console.log('no date or time') ;
    return false;
    
  }
  const currentDate = new Date();
  const currentDateFormatted = currentDate.toISOString().split('T')[0]; // 'yyyy-mm-dd'

  if (currentDateFormatted > this.appointment.date) {
    return true;
  }
 console.log('currentDateFormatted',currentDateFormatted) ;
  console.log('this.appointment.date',this.appointment.date) ;
 
  if (currentDateFormatted === this.appointment.date.split('T')[0]) {
    console.log('currentDateFormatted',currentDateFormatted) ;
    
    const [appointmentHour, appointmentMinute] = this.appointment.time.split(':');
    const currentTime = currentDate.getHours() * 60 + currentDate.getMinutes();
    const appointmentTime = parseInt(appointmentHour) * 60 + parseInt(appointmentMinute);
    console.log('currentTime',currentTime) ;
    console.log('appointmentTime',appointmentTime) ;
    
    return currentTime >= appointmentTime;
  }

  return false;
}
 
}
