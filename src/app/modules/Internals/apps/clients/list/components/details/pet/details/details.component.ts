import { Component, inject, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Pet } from 'app/shared/models/pet';
import { PetService } from 'app/shared/services/pet.service';
import {CommonModule, DatePipe } from '@angular/common';
import { Appointment } from 'app/shared/models/appointment';
import { AppointmentService } from 'app/shared/services/appointment.service';
import { MatPaginator } from '@angular/material/paginator';
import { LoadingService } from 'app/shared/services/loading.service';
import { forkJoin } from 'rxjs';
import { getImageUrl } from 'app/shared/utils/image-utils';
@Component({
  selector: 'app-details',
  imports: [DatePipe,MatPaginator,CommonModule],
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
    _loadingService = inject(LoadingService);
  petId: string;
    currentSize = 10;
      currentPage = 1;
      filterSearch: string;
      @ViewChild(MatPaginator) paginator: MatPaginator;
    ngOnInit(): void {
      this.petId = this.route.snapshot.paramMap.get('petId');
      if (this.petId) {
        this._loadingService.show();
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
            this.total = appointments.total;
            this._loadingService.hide();
          },
          error: (err) => {
            console.error('Failed to fetch data:', err);
            this._loadingService.hide();
          }
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
          
        },
        error: (err) => {
          console.error('Failed to fetch appointments:', err);
          
        },
      });
    }

    viewDetails(id: string) {
      const type= localStorage.getItem('connectedUserType');
      if (type === 'external') {
        this.router.navigate(['/home/appointments-history', id]);
      }
      else{
      this.router.navigate(['/home/appointments', id]);}
    }
    getProductImageUrl(imagePath: string): string {
        const url = getImageUrl(imagePath);
        return url;
      }
}
