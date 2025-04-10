import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PetService } from 'app/shared/services/pet.service';

@Component({
  selector: 'app-add',
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './add.component.html',
})
export class AddComponent {
  //********* INJECT SERVICES ***********//
  petForm: FormGroup;
  _petService = inject(PetService);
route= inject(ActivatedRoute);


  constructor(private fb: FormBuilder, private router: Router) {
    this.petForm = this.fb.group({
      name: ['', Validators.required],
      species: ['', Validators.required],
      birthDate: ['', Validators.required],
      icon: ['', Validators.required], // or optional
      ownerId: [''], 
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
  onSubmit() {
    if (this.petForm.valid) {
      
      const newPet = this.petForm.value;
      console.log('Pet to add:', newPet);
      this._petService.createOne(newPet).subscribe({
        next: () => {
          console.log('Pet added successfully!');
          this.router.navigate(['/home/profile']);
        },
        error: (error) => {
          console.error('Error adding pet:', error);
        }
    })
  }
}
}