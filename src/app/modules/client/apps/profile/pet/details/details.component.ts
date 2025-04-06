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
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this._petService.getOne(id).subscribe({
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
