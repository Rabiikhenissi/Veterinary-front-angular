import {AfterViewInit, Component, inject, OnInit, ViewChild} from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import { FilterOptions } from '../../../../../shared/models/filter-options';
import { Pagination } from '../../../../../shared/models/pagination';
import { FuseConfirmationService } from '../../../../../../@fuse/services/confirmation';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatButton, MatIconButton } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInput} from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatPrefix } from '@angular/material/form-field';
import {TranslocoPipe} from "@ngneat/transloco";
import {LoadingService} from "../../../../../shared/services/loading.service";
import { CompanyService } from 'app/shared/services/company.service';
import {Company} from "../../../../../shared/models/company";
import mapboxgl from 'mapbox-gl'
@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  imports: [
        MatFormField,
        MatIcon,
        MatPrefix,
        MatInput,
        FormsModule,
        MatButton,
        MatIconButton,
        MatMenuTrigger,
        MatMenu,
        MatMenuItem,
        MatPaginator,
        TranslocoPipe,
    ],
})
export class ListComponent implements OnInit {
  //********* INJECT SERVICES ***********//
  _companyService= inject(CompanyService);
  _router= inject(Router);
  _fuseConfirmationService= inject(FuseConfirmationService);
  _route= inject(ActivatedRoute);
  _loadingService = inject(LoadingService)
  @ViewChild(MatPaginator) paginator: MatPaginator;
  filterOptions: FilterOptions = new FilterOptions();
  currentSize = 10;
  currentPage = 1;
  displayedList: Pagination<Company>;
  typingTimer;
  doneTypingInterval = 500;
  isScreenSmall: boolean;
  //************* FILTERS *****************//
  openFilter = false;
  filterType: string[] = [];
  filterStatus: string[] = [];
  filterSearch: string;
  map: mapboxgl.Map;
  longitude = -74.5;  
  latitude = 40;      
  zoom = 10;
  ngOnInit(): void {
    this.getList();
  }
 
  initMap(): void {        
    (mapboxgl as any).accessToken = 'pk.eyJ1IjoieW9zcmEtbmFqYXIiLCJhIjoiY2xmdGw2a20wMDF4eTNxcDBiMHZycnZpdCJ9.PTo1tyEyJry6uEKaqRLkRQ';

      this.map = new mapboxgl.Map({
        container: 'map', // ID of the div container
        style: 'mapbox://styles/mapbox/streets-v11', // Map style
        center: [this.longitude, this.latitude], // Initial center coordinates
        zoom: this.zoom, // Initial zoom level
      });
     
      // Loop through the company list and add a marker for each location
      this.displayedList?.data?.forEach(company => {
       
        const marker = new mapboxgl.Marker()
        .setLngLat([company.longitude, company.latitude])
        .addTo(this.map);
        const nameElement = document.createElement('div');
        nameElement.className = 'company-name'; 
        nameElement.innerHTML = `<strong>${company.name}</strong>`;
         new mapboxgl.Marker(nameElement)
          .setLngLat([company.longitude, company.latitude]) // Coordinates from the company
          .setPopup(new mapboxgl.Popup({ offset: 25 }) ) 
          .addTo(this.map);
      });
    }
    
  pageChanged(event: PageEvent ): void {
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
  getList(): void {
    this._loadingService.show();
    this._companyService
      .getList(
        this.currentSize.toString(),
        this.currentPage.toString(),
        this.filterSearch,
        this.filterType.toString(),
        this.filterStatus.toString(),
      )
      .subscribe({
          next: results => {
              this.displayedList = results;
              this.openFilter = false;
              this._loadingService.hide();
              const comp = this.displayedList.data[0];
              this.latitude = comp.latitude;
              this.longitude = comp.longitude;
               setTimeout(() => {
                this.initMap(); 
              }, 10); 
          },
          error: () => {
              this._loadingService.hide();
              this.openFilter = false;
          }
      });
  }
  addOne(): void {
    this._router.navigate(['add'], { relativeTo: this._route }).then();
  }
  openShow(row: Company) {
    this._router.navigate([`${row._id}`], { relativeTo: this._route }).then();
  }
  openEdit(row: Company) {
    this._router.navigate([`${row._id}/edit`], { relativeTo: this._route }).then();
  }
  updateSearch() {
    clearTimeout(this.typingTimer);
    this.filterOptions.search = this.filterSearch;
    this.typingTimer = setTimeout(() => {
      this.paginator?.firstPage();
      this.getList();
    }, this.doneTypingInterval);
  }
  deleteOne(row: Company) {
    // Open the confirmation dialog
    const confirmation = this._fuseConfirmationService.open({
      title: 'Delete',
      message: 'Would you like to confirm the deletion ?',
      actions: {
        confirm: {
          label: 'yes',
        },
        cancel: {
          label: 'no',
        },
      },
    });

    // Subscribe to the confirmation dialog closed action
    confirmation.afterClosed().subscribe((result) => {
      // If the confirm button pressed...
      if (result === 'confirmed') {
        this._companyService.deleteOne(row._id).subscribe(() => {
          this.getList();
        });
      }
    });
  }
  refresh(): void {
    clearTimeout(this.typingTimer);
    this.typingTimer = setTimeout(() => {
      this.getList();
    }, this.doneTypingInterval);
  }
}
