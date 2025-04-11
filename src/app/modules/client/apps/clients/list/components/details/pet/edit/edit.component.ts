import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators ,ReactiveFormsModule} from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';
import { PetService } from 'app/shared/services/pet.service';

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
})
export class EditComponent {
  petForm: FormGroup;
  _petService = inject(PetService);
  route = inject(ActivatedRoute);
  petId!: string;
  id:string;
  constructor(private fb: FormBuilder, private router: Router) {
    this.petForm = this.fb.group({
      name: ['', Validators.required],
      species: ['', Validators.required],
      birthDate: ['', Validators.required],
      icon: [''],
    });
  }
  icons = [
    { icon: 'assets/images/avatars/pets/dog.png', label: 'Dog' },
    { icon: 'assets/images/avatars/pets/cat.png', label: 'Cat' },
    { icon: 'assets/images/avatars/pets/rabbit.png', label: 'Rabbit' },
    { icon: 'assets/images/avatars/pets/fish.png', label: 'Fish' },
    { icon: 'assets/images/avatars/pets/turtle.png', label: 'Turtle' },
    { icon: 'assets/images/avatars/pets/monkey.png', label: 'Monkey' },
  ];

  selectIcon(iconData: { icon: string; label: string }) {
    this.petForm.patchValue({
      icon: iconData.icon,
      species: iconData.label,
    });
  }

  ngOnInit(): void {
    this.petId = this.route.snapshot.paramMap.get('petId') || '';
    this.id= this.route.snapshot.paramMap.get('id') || '';
    this._petService.getClientPet(this.petId,this.id).subscribe({
      next: (pet) => {
        this.petForm.patchValue(pet);
      },
      error: (err) => {
        console.error('Error loading pet:', err);
      },
    });
    
  }

  onSubmit() {
    if (this.petForm.valid) {
      const updatedPet = this.petForm.value;
       updatedPet._id = this.petId; // Ensure the ID is included in the updated pet object
      this._petService.updateOne(updatedPet).subscribe({
        next: () => {
          console.log('Pet updated successfully!');
          console.log('Updated pet:', updatedPet);
          this.router.navigate(['../../..'], { relativeTo: this.route });
          console.log(this.petForm.value);
        },
        error: (err) => {
          console.error('Error updating pet:', err);
        },
      });
    }
  }
}
