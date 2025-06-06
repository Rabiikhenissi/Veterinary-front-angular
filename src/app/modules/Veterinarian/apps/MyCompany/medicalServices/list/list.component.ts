import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { Router, ActivatedRoute } from '@angular/router';
import { CompanyService } from 'app/shared/services/company.service';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [FormsModule, CommonModule,MatPaginator],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit {
  private _companyService = inject(CompanyService);
  private _router = inject(Router);
  private _route = inject(ActivatedRoute);

  services: any[] = [];
  paginatedServices: any[] = [];
  companyName: string;

  // Pagination
total = 0;
  currentSize = 10; // Default page size
  currentPage = 1;
  @ViewChild(MatPaginator) paginator: MatPaginator;


  ngOnInit() {
    this.getServices();
  }
getServices() {
    this._companyService.getOne(localStorage.getItem('connectedUserCompany')).subscribe({
      next: (company) => {
        this.services = company.services;
        this.companyName = company.name;
        this.total = this.services.length;
        this.updatePaginatedServices();
      },
      error: (error) => {
        console.error('Error fetching company data:', error);
      }
    });
  }
updatePaginatedServices() {
    const start = (this.currentPage - 1) * this.currentSize;
    const end = start + this.currentSize;
    this.paginatedServices = this.services.slice(start, end);
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
    this.updatePaginatedServices();
  }
  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedServices();
    }
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
