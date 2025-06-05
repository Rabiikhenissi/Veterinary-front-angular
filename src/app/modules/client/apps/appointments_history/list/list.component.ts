import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { Appointment } from 'app/shared/models/appointment';
import { Pagination } from 'app/shared/models/pagination';
import { AppointmentService } from 'app/shared/services/appointment.service';
import { AuthService } from 'app/shared/services/auth.service';
import { LoadingService } from 'app/shared/services/loading.service';

@Component({
  selector: 'app-list',
  imports: [DatePipe,CommonModule,MatPaginator],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit {
  _loadingService=inject(LoadingService)
  route=inject(ActivatedRoute);
  router=inject(Router);
  userId: string;
  appointments: Appointment[] = [];
  currentSize = 10;
  currentPage = 1;
  total = 0;
  filterSearch: string;
  displayedList: Pagination<Appointment>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  constructor(
    private appointmentService: AppointmentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
     this.userId = localStorage.getItem('connectedUserId');
    
    if (this.userId) {
      this.fetchAppointments(this.userId);
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
      
    this.fetchAppointments(this.userId);
  }

  fetchAppointments(userId): void {
    this._loadingService.show()
    this.appointmentService.getAppointmentsByUser(this.currentSize.toString(),this.currentPage.toString(),this.filterSearch,userId).subscribe({
      next: (response) => {
        this.appointments=response.data;
        this.total= response.total;
        this._loadingService.hide()
      },
      error: (error) => {
        console.error('Error fetching appointments:', error);
        this._loadingService.hide()
    }
    });
  }
  navigateToDetails(appointmentId: string): void {
    this.router.navigate([ appointmentId], { relativeTo: this.route }); 
  }
}
