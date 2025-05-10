import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PetSpecies } from 'app/shared/models/petSpecies';
import { PetSpeciesService } from 'app/shared/services/petSpecies.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add',
  imports: [CommonModule, FormsModule,ReactiveFormsModule],
  templateUrl: './add.component.html',
  styleUrl: './add.component.scss'
})
export class AddComponent {
  speciesForm: FormGroup;
  loading = false;
 _fb =inject(FormBuilder);
  _petSpeciesService = inject(PetSpeciesService); 
  _router = inject(Router); 
  _route = inject(ActivatedRoute);
  constructor() {
    this.speciesForm = this._fb.group({
      name: ['', Validators.required],
      icon: ['', [Validators.required, Validators.pattern(/https?:\/\/.+\.(jpg|jpeg|png|webp|svg)/)]],
    });
  }
  
  
  submit() {
    if (this.speciesForm.invalid) return;
    this.loading = true;
console.log('Form submitted:', this.speciesForm.value); 
const species: PetSpecies = {
  name: this.speciesForm.value.name,
  icon: this.speciesForm.value.icon,
  companyId: localStorage.getItem('connectedUserCompany') 
  
};
console.log('species',species) ;
console.log('companyId',localStorage.getItem('connectedUserCompany'))


    this._petSpeciesService.createOne(species).subscribe({
      next: () => {
        this.loading = false;
Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Pet Species added successfully.',
                      timer: 1000,
                      showConfirmButton: false,
                  }).then(() => {
                    this._router.navigate([`../`], { relativeTo: this._route }).then();        });      },
      error: err => {
        console.error(err);
        this.loading = false;
      }
    });
  }
}