import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput, MatInputModule } from '@angular/material/input';
import { MatPaginator } from '@angular/material/paginator';
import { MatOption, MatSelect } from '@angular/material/select';
import { Router, ActivatedRoute } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { FeaturesDirective } from 'app/shared/directives/features.directive';
import { FeatureActions } from 'app/shared/enums/feature-actions';
import { FeatureCodes } from 'app/shared/enums/feature-codes';
import { FilterOptions } from 'app/shared/models/filter-options';
import { CompanyService } from 'app/shared/services/company.service';
import { LoadingService } from 'app/shared/services/loading.service';
import { MedicalServicesService } from 'app/shared/services/medicalServices.service';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [FormsModule,FeaturesDirective, CommonModule,MatIconButton,MatButton,MatPaginator,MatInputModule,MatSelect,MatOption,MatLabel,MatFormField,MatIcon,MatLabel],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit {
  private _loadingService = inject(LoadingService);
  private _medicalServicesService = inject(MedicalServicesService);
  private _router = inject(Router);
  private _route = inject(ActivatedRoute);
  private _companyService = inject(CompanyService);
  services: any[] = [];
  companyName: string;
  searchQuery: string = '';
featureCodes=FeatureCodes
featureActions=FeatureActions
currentPage = 1;
  total = 0;
  currentSize = 10;
  filterOptions: FilterOptions = new FilterOptions();
  openFilter = false;
filterArchived: boolean = false;
filterPriceMin: number | null = null;
filterPriceMax: number | null = null;
  typingTimer;
  doneTypingInterval = 500;
  filterSearch: string;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
_fuseConfirmationService = inject(FuseConfirmationService);

ngOnInit() {
  this.getList();
  const companyId = localStorage.getItem('connectedUserCompany');
  if (companyId) {
    this._companyService.getOne(companyId).subscribe({
      next: (company) => {
        this.companyName = company?.name || '';
      },
      error: () => {
        this.companyName = '';
      }
    });
  }
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
      this.filterArchived, 
      this.filterPriceMin != null ? this.filterPriceMin.toString() : undefined,
    this.filterPriceMax != null ? this.filterPriceMax.toString() : undefined
   
    )
    .subscribe({
      next: results => {
        this.services = results.data;
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
  this.confirmAction(
    'Are you sure you want to archive this medical service? You can restore it later if needed.',
    () => {
      this._loadingService.show();
      this._medicalServicesService.archiveOne(service._id).subscribe({
        next: () => {
          this._loadingService.hide();
          this.getList();
        },
        error: () => {
          console.error('Failed to archive service');
          this._loadingService.hide();
        }
      });
    }
  );
}


  applyFilters() {
  this.currentPage = 1;
  this.paginator?.firstPage();
  this.getList();
  this.openFilter = false;
}

resetFilters() {
  this.filterArchived = false;
  this.filterPriceMin = null;
  this.filterPriceMax = null;
}

restoreService(service: any) {
  this.confirmAction(
    'Do you want to restore this medical service? It will become available again.',
    () => {
      this._loadingService.show();
      this._medicalServicesService.restoreOne(service._id).subscribe({
        next: () => {
          this._loadingService.hide();
          this.getList();
        },
        error: () => {
          this._loadingService.hide();
          console.error('Failed to restore service');
        }
      });
    }
  );
}

deleteService(service: any) {
  this.confirmAction(
    'Are you sure you want to permanently delete this medical service? This action cannot be undone.',
    () => {
      this._loadingService.show();
      this._medicalServicesService.deleteOne(service._id).subscribe({
        next: () => {
          this._loadingService.hide();
          this.getList();
        },
        error: () => {
          this._loadingService.hide();
          console.error('Failed to delete service');
        }
      });
    }
  );
}
confirmAction(message: string, action: () => void) {
  this._fuseConfirmationService.open({
    title: 'Confirmation',
    message,
    actions: {
      confirm: { show: true, label: 'Confirm' },
      cancel: { show: true, label: 'Cancel' }
    }
  }).afterClosed().subscribe(result => {
    if (result === 'confirmed') {
      action();
    }
  });
}


}
