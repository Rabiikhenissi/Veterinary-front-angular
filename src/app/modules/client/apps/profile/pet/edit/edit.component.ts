import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators ,ReactiveFormsModule} from '@angular/forms';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';
import { PetSpecies } from 'app/shared/models/petSpecies';
import { PetService } from 'app/shared/services/pet.service';
import { PetSpeciesService } from 'app/shared/services/petSpecies.service';
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
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatDatepickerModule],
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
  
  route = inject(ActivatedRoute);
  petId!: string;
  today: Date = new Date();
  constructor(private fb: FormBuilder, private router: Router) {
    this.petForm = this.fb.group({
      name: ['', Validators.required],
      species: ['', Validators.required],
      birthDate: ['', Validators.required],
      icon: [''],
    });
  }
speciesOptions: PetSpecies[] = []; 
  
   

  selectIcon(iconData: { icon: string; label: string }) {
    this.petForm.patchValue({
      icon: iconData.icon,
      species: iconData.label,
    });
  }

  ngOnInit(): void {
    this.petId = this.route.snapshot.paramMap.get('id') || '';
    this._petService.getOne(this.petId).subscribe({
      next: (pet) => {
        const formattedDate = this.formatDateForInput(pet.birthDate);
        pet.birthDate = formattedDate;
        this.petForm.patchValue(pet);      },
      error: (err) => {
        console.error('Error loading pet:', err);
      },
    });
    this._petSpeciesService.getList().subscribe({
      next: (res) => {
        this.speciesOptions = res.data;
      },
      error: (err) => {
        console.error('Failed to fetch species', err);
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
       updatedPet._id = this.petId; // Ensure the ID is included in the updated pet object
      this._petService.updateOne(updatedPet).subscribe({
        next: () => {
          console.log('Pet updated successfully!');
          console.log('Updated pet:', updatedPet);
          this.router.navigate(['/home/profile']);
          console.log(this.petForm.value);
        },
        error: (err) => {
          console.error('Error updating pet:', err);
        },
      });
    }
  }
}