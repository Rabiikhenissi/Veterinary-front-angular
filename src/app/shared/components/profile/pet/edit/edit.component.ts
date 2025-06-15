import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators ,ReactiveFormsModule} from '@angular/forms';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
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
  providers: [
          { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
          { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }, // Locale set to 'en-GB' for dd/mm/yyyy
          provideNativeDateAdapter(), // Ensure proper native date handling
        ],
})
export class EditComponent implements OnInit {
  petForm: FormGroup;
  _petService = inject(PetService);
    _petSpeciesService = inject(PetSpeciesService);
  _loadingService = inject(LoadingService);
  route = inject(ActivatedRoute);
  petId!: string;
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
  
   getProductImageUrl(imagePath: string): string {
           const url = getImageUrl(imagePath);
           return url;
         }

  selectIcon(iconData: { icon: string; label: string }) {
    this.petForm.patchValue({
      icon: iconData.icon,
      species: iconData.label,
    });
  }

  ngOnInit(): void {
  this.petId = this.route.snapshot.paramMap.get('id') || '';
  this._loadingService.show();

  forkJoin({
    pet: this._petService.getOne(this.petId),
    species: this._petSpeciesService.getList(localStorage.getItem('connectedCompanyId'))
  }).subscribe({
    next: ({ pet, species }) => {
      const formattedDate = this.formatDateForInput(pet.birthDate);
      pet.birthDate = formattedDate;
      this.petForm.patchValue(pet);
      this.speciesOptions = species.data;
    },
    error: (err) => {
      console.error('Error loading data:', err);
      this._loadingService.hide();
    },
    complete: () => {
      this._loadingService.hide();
    }
  });
}
  formatDateForInput(date: string): string {
    const formattedDate = new Date(date);
    return formattedDate.toISOString().split('T')[0]; 
  }
  onSubmit() {
    if (this.petForm.valid) {
      const updatedPet = this.petForm.value;
      this._loadingService.show(); // Start loading
      updatedPet._id = this.petId; // Ensure the ID is included in the updated pet object
      this._petService.updateOne(updatedPet).subscribe({
        next: () => {
          this._loadingService.hide(); // Stop loading
          this.router.navigate(['/home/profile']);
        },
        error: (err) => {
          this._loadingService.hide(); // Stop loading
          console.error('Error updating pet:', err);
        },
      });
    }
  }
  onCancel() {
  this.router.navigate(['/home/profile']);
}
}