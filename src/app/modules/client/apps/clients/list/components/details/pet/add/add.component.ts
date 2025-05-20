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
import { UserService } from 'app/shared/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add',
  imports: [ReactiveFormsModule,CommonModule,MatFormFieldModule, MatInputModule, MatDatepickerModule
  ],
  templateUrl: './add.component.html',
})
export class AddComponent implements OnInit {
  petForm: FormGroup;
  _petService = inject(PetService);
route=inject(ActivatedRoute);
userId:string;
today: string = new Date().toISOString().split('T')[0];
  _userService = inject(UserService);
    _petSpeciesService = inject(PetSpeciesService);
  
  constructor(private fb: FormBuilder, private router: Router) {
    this.petForm = this.fb.group({
  name: ['', Validators.required],
  birthDate: ['', Validators.required],
  icon: ['', Validators.required], 
  species: ['', Validators.required],
  ownerId: [''],
});

    this.userId=this.route.snapshot.paramMap.get('id') || '';
  
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
          if(error.status === 400) {
                      Swal.fire({
                        icon: 'error',
                        title: 'cant add pet',
                        text: 'pet name already exists for this user',
                        confirmButtonColor: '#f87171',
                    })}
        }
    })
  }
}
}
