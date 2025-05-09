import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { PetSpecies } from 'app/shared/models/petSpecies';
import { PetSpeciesService } from 'app/shared/services/petSpecies.service';

@Component({
  selector: 'app-list',
  imports: [CommonModule,FormsModule],
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
  ngOnInit(): void {
    this.getSpeciesList();
  }

  // Fetch all pet species
  getSpeciesList() {
    this._petSpeciesService.getList().subscribe(
      (data) => {
        this.speciesList = data.data;  
      },
      (error) => {
        console.error('Error fetching pet species:', error);
      }
    );
  }
   // Handle the species selection
   selectSpecies(species: PetSpecies) {
    this.selectedSpeciesId = species._id;
  }
  add() {
    this._router.navigate([`add`], { relativeTo: this._route });
  }
 
  editSpecies(species: any) {
    this._router.navigate([`${species._id}/edit`], { relativeTo: this._route }).then();
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
