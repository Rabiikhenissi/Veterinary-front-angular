import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators ,ReactiveFormsModule} from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';
import { PetSpecies } from 'app/shared/models/petSpecies';
import { LoadingService } from 'app/shared/services/loading.service';
import { PetService } from 'app/shared/services/pet.service';
import { PetSpeciesService } from 'app/shared/services/petSpecies.service';
import { getImageUrl } from 'app/shared/utils/image-utils';
import { forkJoin } from 'rxjs';

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY', 
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-edit',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatDatepickerModule,CommonModule],
  templateUrl: './edit.component.html',
})
export class EditComponent {
  petForm: FormGroup;
  _petService = inject(PetService);
      _petSpeciesService = inject(PetSpeciesService);
  _loadingService = inject(LoadingService);
  route = inject(ActivatedRoute);
  petId!: string;
  id:string;
  today: Date = new Date();
  constructor(private fb: FormBuilder, private router: Router) {
    this.petForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      species: ['', Validators.required],
      birthDate: ['', Validators.required],
      icon: [''],
    });
  }
  speciesOptions: PetSpecies[] = []; 
  

  selectIcon(iconData: { icon: string; name: string }) {
    this.petForm.patchValue({
      icon: iconData.icon,
      species: iconData.name,
    });
  }

  ngOnInit(): void {
  this._loadingService.show();
  this.petId = this.route.snapshot.paramMap.get('petId') || '';
  this.id = this.route.snapshot.paramMap.get('id') || '';
  const companyId = localStorage.getItem('connectedCompanyId');

  forkJoin({
    pet: this._petService.getClientPet(this.petId, this.id),
    species: this._petSpeciesService.getList(companyId)
  }).subscribe({
    next: ({ pet, species }) => {
      this.petForm.patchValue(pet);
      this.speciesOptions = species.data;
      this._loadingService.hide();
    },
    error: (err) => {
      this._loadingService.hide();
      console.error('Error loading pet or species:', err);
    }
  });
}

  onSubmit() {
    if (this.petForm.valid) {
      const updatedPet = this.petForm.value;
      this._loadingService.show();
       updatedPet._id = this.petId; // Ensure the ID is included in the updated pet object
      this._petService.updateOne(updatedPet).subscribe({
        next: () => {
          this._loadingService.hide();
          this.router.navigate(['../../..'], { relativeTo: this.route });
          
        },
        error: (err) => {
          this._loadingService.hide();
          console.error('Error updating pet:', err);
        },
      });
    }
  }
  onCancel() {
    this.router.navigate(['../../..'], { relativeTo: this.route });
  }
  getProductImageUrl(imagePath: string): string {
        const url = getImageUrl(imagePath);
        return url;
      }
     
}
