import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CompanyService } from 'app/shared/services/company.service';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [FormsModule, CommonModule],
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
  currentPage: number = 1;
  pageSize: number = 8;
  totalPages: number = 1;

  ngOnInit() {
    this._companyService.getOne(localStorage.getItem('connectedUserCompany')).subscribe({
      next: (company) => {
        this.services = company.services;
        this.companyName = company.name;
        this.totalPages = Math.ceil(this.services.length / this.pageSize);
        this.updatePaginatedServices();
      },
      error: (error) => {
        console.error('Error fetching company data:', error);
      }
    });
  }

  updatePaginatedServices() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedServices = this.services.slice(start, end);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedServices();
    }
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
