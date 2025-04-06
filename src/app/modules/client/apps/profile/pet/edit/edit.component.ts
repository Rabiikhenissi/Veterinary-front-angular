import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators ,ReactiveFormsModule} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PetService } from 'app/shared/services/pet.service';
@Component({
  selector: 'app-edit',
  imports: [ReactiveFormsModule],
  templateUrl: './edit.component.html',
})
export class EditComponent {
  petForm: FormGroup;
  _petService = inject(PetService);
  route = inject(ActivatedRoute);
  petId!: string;

  constructor(private fb: FormBuilder, private router: Router) {
    this.petForm = this.fb.group({
      name: ['', Validators.required],
      species: ['', Validators.required],
      birthDate: ['', Validators.required],
      icon: [''],
    });
  }

  ngOnInit(): void {
    this.petId = this.route.snapshot.paramMap.get('id') || '';
    this._petService.getOne(this.petId).subscribe({
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
          this.router.navigate(['/home/profile']);
        },
        error: (err) => {
          console.error('Error updating pet:', err);
        },
      });
    }
  }
}
