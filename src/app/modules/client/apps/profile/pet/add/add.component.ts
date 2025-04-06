import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PetService } from 'app/shared/services/pet.service';

@Component({
  selector: 'app-add',
  imports: [ReactiveFormsModule],
  templateUrl: './add.component.html',
})
export class AddComponent {
  petForm: FormGroup;
  _petService = inject(PetService);
  constructor(private fb: FormBuilder, private router: Router) {
    this.petForm = this.fb.group({
      name: ['', Validators.required],
      species: ['', Validators.required],
      birthDate: ['', Validators.required],
      icon: ['', Validators.required], // or optional
    });
  
  }

  onSubmit() {
    if (this.petForm.valid) {
      const newPet = this.petForm.value;
      console.log('Pet to add:', newPet);
      this._petService.createOne(newPet).subscribe({
        next: () => {
          console.log('Pet added successfully!');
          this.router.navigate(['/profile']);
        },
        error: (error) => {
          console.error('Error adding pet:', error);
        }
    })
  }
}
}