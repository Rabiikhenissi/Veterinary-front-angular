import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PetService } from 'app/shared/services/pet.service';
import { UserService } from 'app/shared/services/user.service';

@Component({
  selector: 'app-add',
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './add.component.html',
})
export class AddComponent {
  petForm: FormGroup;
  _petService = inject(PetService);
route=inject(ActivatedRoute);
userId:string;
  _userService = inject(UserService);
  constructor(private fb: FormBuilder, private router: Router) {
    this.petForm = this.fb.group({
      name: ['', Validators.required],
      species: ['', Validators.required],
      birthDate: ['', Validators.required],
      icon: ['', Validators.required], // or optional
      ownerId: [''], 
    });

    this.userId=this.route.snapshot.paramMap.get('id') || '';
  
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
      this.petForm.patchValue({ ownerId: this.userId });
      this._petService.createOneSecretary(this.petForm.value).subscribe({
        next: () => {
          console.log('Pet added successfully!');
          console.log(this.petForm.value);
          this.router.navigate(['../..'], { relativeTo: this.route });
          
        },
        error: (error) => {
          console.error('Error adding pet:', error);
        }
    })
  }
}
}
