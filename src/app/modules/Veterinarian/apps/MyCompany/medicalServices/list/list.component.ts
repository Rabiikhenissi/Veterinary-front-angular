import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { Router, ActivatedRoute } from '@angular/router';
import { FilterOptions } from 'app/shared/models/filter-options';
import { LoadingService } from 'app/shared/services/loading.service';
import { MedicalServicesService } from 'app/shared/services/medicalServices.service';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [FormsModule, CommonModule,MatPaginator],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit {
  private _loadingService = inject(LoadingService);
  private _medicalServicesService = inject(MedicalServicesService);
  private _router = inject(Router);
  private _route = inject(ActivatedRoute);
  services: any[] = [];
  companyName: string;
  searchQuery: string = '';

currentPage = 1;
  total = 0;
  currentSize = 10;
  filterOptions: FilterOptions = new FilterOptions();
  typingTimer;
  doneTypingInterval = 500;
  filterSearch: string;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

ngOnInit() {
  this.getList();
}
getList(): void {
  const companyId = localStorage.getItem('connectedUserCompany');
  this._loadingService.show();

  this._medicalServicesService
    .getList(
      this.currentSize.toString(),
        this.currentPage.toString(),
        this.searchQuery,
        
      companyId, 
      false      
    )
    .subscribe({
      next: results => {
        this.services = results.data;
        console.log('Medical Services:', this.services);
         this.total = results.total;
        this._loadingService.hide();
      },
      error: () => {
        this._loadingService.hide();
      }
    });
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
    this.getList();
  }

  add() {
    this._router.navigate(['add'], { relativeTo: this._route });
  }

  editService(service: any) {    
    this._router.navigate([`${service._id}/edit`], { relativeTo: this._route }).then();
  }

  archiveService(service: any) {
    // Add your archive logic here
    console.log('Archiving service:', service);
  }
}
