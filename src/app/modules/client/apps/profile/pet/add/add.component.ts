import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router } from '@angular/router';
import { PetSpecies } from 'app/shared/models/petSpecies';
import { PetService } from 'app/shared/services/pet.service';
import { PetSpeciesService } from 'app/shared/services/petSpecies.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add',
  imports: [ReactiveFormsModule,CommonModule,MatFormFieldModule, MatInputModule, MatDatepickerModule],
  templateUrl: './add.component.html',
})
export class AddComponent implements OnInit {
  //********* INJECT SERVICES ***********//
  petForm: FormGroup;
  _petService = inject(PetService);
  _petSpeciesService = inject(PetSpeciesService);
  
route= inject(ActivatedRoute);
today: string = new Date().toISOString().split('T')[0];


  constructor(private fb: FormBuilder, private router: Router) {
    this.petForm = this.fb.group({
  name: ['', Validators.required],
  birthDate: ['', Validators.required],
  icon: ['', Validators.required], // acts as the species selection
  species: ['', Validators.required],
  ownerId: [''],
});
  console.log(this.router.config)
  }
  
   speciesOptions: PetSpecies[] = []; 
  
    ngOnInit() {
    this._petSpeciesService.getList(localStorage.getItem('connectedCompanyId')).subscribe({
        next: (res) => {
          this.speciesOptions = res.data;
        },
        error: (err) => {
          console.error('Failed to fetch species', err);
        }
      });
    }
  selectIcon(iconData: { icon: string; name: string }) {
    this.petForm.patchValue({
      icon: iconData.icon,
      species: iconData.name,
    });
    console.log('Selected icon:', iconData.name);
    console.log('petForm value:', this.petForm.value);
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
          if(error.status === 400) {
            Swal.fire({
              icon: 'error',
              title: 'cant add pet',
              text: 'pet name already exists',
              confirmButtonColor: '#f87171',
          })}
        }
    })
  }
}
}