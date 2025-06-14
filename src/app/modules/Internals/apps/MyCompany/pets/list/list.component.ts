import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { Router, ActivatedRoute } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { PetSpecies } from 'app/shared/models/petSpecies';
import { LoadingService } from 'app/shared/services/loading.service';
import { PetSpeciesService } from 'app/shared/services/petSpecies.service';
import { getImageUrl } from 'app/shared/utils/image-utils';

@Component({
  selector: 'app-list',
  imports: [CommonModule,FormsModule,MatPaginator],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit {
  speciesList: PetSpecies[] = [];
  selectedSpeciesId: string | null = null;
  _petSpeciesService = inject(PetSpeciesService); 
_router = inject(Router);
_route = inject(ActivatedRoute);
_fuseConfirmationService = inject(FuseConfirmationService);
total = 0;
_loadingService = inject(LoadingService);
  currentSize = 10; // Default page size
  currentPage = 1;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngOnInit(): void {
    this.getSpeciesList();
  }

  // Fetch all pet species
  getSpeciesList() {
    this._loadingService.show();
    this._petSpeciesService.getList(localStorage.getItem('connectedCompanyId'),
  this.currentSize.toString(),
      this.currentPage.toString()
  ).subscribe({
      next: (res) => {
        this._loadingService.hide();
        this.speciesList = res.data;
        this.total = res.total;
      },
      error: (err) => {
        this._loadingService.hide();
        console.error('Failed to fetch species', err);
      }
    });
  }
      
   // Handle the species selection
   selectSpecies(species: PetSpecies) {
    this.selectedSpeciesId = species._id;
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
    this.getSpeciesList();
  }
  add() {
    this._router.navigate([`add`], { relativeTo: this._route });
  }
 
  editSpecies(species: any) {
    this._router.navigate([`${species._id}/edit`], { relativeTo: this._route }).then();
  }   

 
 getProductImageUrl(imagePath: string): string {
         const url = getImageUrl(imagePath);
         return url;
       }
archiveSpecies(species: PetSpecies): void {
  const confirmation = this._fuseConfirmationService.open({
title: 'Archive Species',
message: `Would you like to archive  ${species.name} ?`,
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
  this._petSpeciesService.archiveOne(species._id).subscribe({
    next: () => {
      console.log(`Pet Species archived: ${species.name}`);
      
      this.getSpeciesList();
    },
    error: (error) => {
      console.error('Archive Error:', error);
    }
  });
}
});
}
 
}
