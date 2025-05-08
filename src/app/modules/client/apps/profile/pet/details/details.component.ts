import { Component, inject, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Pet } from 'app/shared/models/pet';
import { PetService } from 'app/shared/services/pet.service';
import {DatePipe } from '@angular/common';
import { AppointmentService } from 'app/shared/services/appointment.service';
import { Appointment } from 'app/shared/enums/appointment';
import { MatPaginator } from '@angular/material/paginator';
@Component({
  selector: 'app-details',
  imports: [DatePipe,MatPaginator,RouterLink],
  templateUrl: './details.component.html',
})
export class DetailsComponent {
  router= inject(Router);
  _petService = inject(PetService);
  _appointmentService = inject(AppointmentService);
  route = inject(ActivatedRoute);
total=0;
  pet?: Pet;
  appointments: Appointment[] = [];
  loading = true;
  loadingAppointments = true;
petId: string;
  currentSize = 10;
    currentPage = 1;
    filterSearch: string;
    @ViewChild(MatPaginator) paginator: MatPaginator;
  ngOnInit(): void {
     this.petId = this.route.snapshot.paramMap.get('id');
    if (this.petId) {
      this._petService.getOne(this.petId).subscribe({
        next: (data) => {
          this.pet = data;
          this.loading = false;

          // Fetch appointments for the pet
          this.fetchAppointments(this.petId);},
        error: (err) => {
          console.error('Failed to fetch pet:', err);
          this.loading = false;
        },
      });
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
        this.loadingAppointments = false;
      },
      error: (err) => {
        console.error('Failed to fetch appointments:', err);
        this.loadingAppointments = false;
      },
    });
  }
  viewDetails(id: string) {
    this.router.navigate(['/home/appointments-history', id]);
  }
  
}