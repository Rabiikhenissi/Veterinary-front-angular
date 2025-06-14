import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PetSpecies } from 'app/shared/models/petSpecies';
import { LoadingService } from 'app/shared/services/loading.service';
import { PetSpeciesService } from 'app/shared/services/petSpecies.service';
import { getImageUrl } from 'app/shared/utils/image-utils';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add',
  imports: [CommonModule, FormsModule,ReactiveFormsModule],
  templateUrl: './add.component.html',
  styleUrl: './add.component.scss'
})
export class AddComponent {
  speciesForm: FormGroup;
  _loadingSerivice = inject(LoadingService);
 _fb =inject(FormBuilder);
  _petSpeciesService = inject(PetSpeciesService); 
  _router = inject(Router); 
  _route = inject(ActivatedRoute);
  constructor() {
    this.speciesForm = this._fb.group({
      name: ['',  [Validators.required, Validators.minLength(2)]],
       icon: [null, Validators.required]
    });
  }
  
  onFileSelected(event: Event): void {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  this._petSpeciesService.uploadImage(file).subscribe({
    next: (res) => {
      this.speciesForm.patchValue({ icon: res.imageUrl });
    },
    error: (err) => {
      console.error('Image upload failed', err);
      Swal.fire({
        icon: 'error',
        title: 'Image Upload Failed',
        text: 'Please try again.',
      });
    }
  });
}

getProductImageUrl(imagePath: string): string {
        const url = getImageUrl(imagePath);
        return url;
      }
  submit() {
    if (this.speciesForm.invalid) return;
    this._loadingSerivice.show();
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
        this._loadingSerivice.hide();
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
        this._loadingSerivice.hide();
      }
    });
  }
}