import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Pet } from 'app/shared/models/pet';
import { PetService } from 'app/shared/services/pet.service';
import {DatePipe } from '@angular/common';
@Component({
  selector: 'app-details',
  imports: [DatePipe],
  templateUrl: './details.component.html',
})
export class DetailsComponent {
  _petService = inject(PetService);
  route = inject(ActivatedRoute);
  pet?: Pet;
  loading = true;

  ngOnInit(): void {
    const petId = this.route.snapshot.paramMap.get('petId');
    const id = this.route.snapshot.paramMap.get('id');
    if (id && petId) {
      this._petService.getClientPet(petId,id).subscribe({
        next: (data) => {
          this.pet = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to fetch pet:', err);
          this.loading = false;
        },
      });
    }
  }
}
