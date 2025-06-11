import { Component, inject, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Pet } from 'app/shared/models/pet';
import { PetService } from 'app/shared/services/pet.service';
import {CommonModule, DatePipe } from '@angular/common';
import { AppointmentService } from 'app/shared/services/appointment.service';
import { Appointment } from 'app/shared/models/appointment';
import { MatPaginator } from '@angular/material/paginator';
import { LoadingService } from 'app/shared/services/loading.service';
import { forkJoin } from 'rxjs';
import { UserService } from 'app/shared/services/user.service';
@Component({
  selector: 'app-details',
  imports: [DatePipe,MatPaginator,RouterLink,CommonModule],
  templateUrl: './details.component.html',
})
export class DetailsComponent {
  router= inject(Router);
  _petService = inject(PetService);
  _appointmentService = inject(AppointmentService);
  _userService = inject(UserService);
  route = inject(ActivatedRoute);
  _loadingService = inject(LoadingService);
total=0;
  pet?: Pet;
  appointments: Appointment[] = [];
petId: string;
  currentSize = 10;
    currentPage = 1;
    filterSearch: string;
    @ViewChild(MatPaginator) paginator: MatPaginator;
  ngOnInit(): void {
    this.petId = this.route.snapshot.paramMap.get('id');
    this._loadingService.show(); // Start loading
    if (this.petId) {
      // Use forkJoin to fetch pet and appointments in parallel
      
        forkJoin({
          pet: this._petService.getOne(this.petId),
          appointments: this._appointmentService.getAppointmentsByPet(
            this.currentSize.toString(),
            this.currentPage.toString(),
            this.filterSearch,
            this.petId
          )
        }).subscribe({
          next: ({ pet, appointments }) => {
            this.pet = pet;
            this.appointments = appointments.data;
            console.log('Pet:', this.pet);
            console.log('Appointments:', this.appointments);
            
            this.total = appointments.total;
            this._loadingService.hide();
          },
          error: (err) => {
            console.error('Failed to fetch pet or appointments:', err);
            this._loadingService.hide();
          }
        });
      ;
    }
  }

  pageChanged(event: any): void {
    let { pageIndex } = event;
    const { pageSize } = event;
      pageIndex++;
      if (pageSize !== this.currentSize) {
        pageIndex = 1;
        this.paginator.firstPage();
      }
      this.currentSize = pageSize;
      this.currentPage = pageIndex;
      
    this.fetchAppointments(this.petId);
  }
  
  fetchAppointments(petId): void {
    this._appointmentService.getAppointmentsByPet(this.currentSize.toString(),this.currentPage.toString(),this.filterSearch,petId).subscribe({
      next: (appts) => {
        this.appointments = appts.data;

        this.total = appts.total;
        
      },
      error: (err) => {
        console.error('Failed to fetch appointments:', err);
        
      },
    });
  }
  viewDetails(id: string): void {
    const connectedUserId = localStorage.getItem('connectedUserId');
    if (!connectedUserId) {
      console.error('No connected user ID found in localStorage.');
      return;
    }
    this._userService.getOne(connectedUserId).subscribe({
      next: (connectedUser: any) => {
        console.log('Connected User:', connectedUser);
        const userType: string = connectedUser?.type;
        if (userType === 'external') {
          this.router.navigate(['/home/appointments-history', id]);
        } else if (userType === 'internal') {
          this.router.navigate(['/home/appointment', id]);
        }
      },
      error: (err: any) => {
        console.error('Error fetching connected user:', err);
      }
    });
  }
  
}