import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PetSpecies } from 'app/shared/models/petSpecies';
import { LoadingService } from 'app/shared/services/loading.service';
import { PetSpeciesService } from 'app/shared/services/petSpecies.service';
import Swal from 'sweetalert2';
import { getImageUrl } from 'app/shared/utils/image-utils';

@Component({
  selector: 'app-edit',
  imports: [CommonModule, FormsModule,ReactiveFormsModule],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss'
})
export class EditComponent implements OnInit {
  speciesForm!: FormGroup;
  speciesId!: string;
  

  private _fb = inject(FormBuilder);
  private _petSpeciesService = inject(PetSpeciesService);
  private _router = inject(Router);
  private _route = inject(ActivatedRoute);
  _loadingService = inject(LoadingService);
  ngOnInit() {
    this.speciesForm = this._fb.group({
      name: ['',  [Validators.required, Validators.minLength(2)]],
      icon: [null, Validators.required]
    });

    this.speciesId = this._route.snapshot.paramMap.get('id')!;
    console.log('speciesId', this.speciesId);
    this._loadingService.show();
    this._petSpeciesService.getOne(this.speciesId).subscribe({
      next: (species: PetSpecies) => {
        this.speciesForm.patchValue({
          name: species.name,
          icon: species.icon,
        });
        this._loadingService.hide();
      },
      error: err => {
        this._loadingService.hide();
        console.error(err);
      }
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

    
    const updatedSpecies = {
      _id: this.speciesId,
      ...this.speciesForm.value
    };
    this._loadingService.show();
    this._petSpeciesService.updateOne(updatedSpecies).subscribe({
      next: () => {
        this._loadingService.hide();
        Swal.fire({
                            icon: 'success',
                            title: 'Success!',
                            text: 'Pet Species updated successfully.',
                              timer: 1000,
                              showConfirmButton: false,
                          }).then(() => {
                            this._router.navigate([`../..`], { relativeTo: this._route }).then();        });
      },
      error: err => {
        console.error(err);
        this._loadingService.hide();
      }
    });
  }
}