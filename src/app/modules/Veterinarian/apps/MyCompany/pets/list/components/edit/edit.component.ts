import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PetSpecies } from 'app/shared/models/petSpecies';
import { PetSpeciesService } from 'app/shared/services/petSpecies.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit',
  imports: [CommonModule, FormsModule,ReactiveFormsModule],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss'
})
export class EditComponent implements OnInit {
  speciesForm!: FormGroup;
  speciesId!: string;
  loading = false;

  private _fb = inject(FormBuilder);
  private _petSpeciesService = inject(PetSpeciesService);
  private _router = inject(Router);
  private _route = inject(ActivatedRoute);

  ngOnInit() {
    this.speciesForm = this._fb.group({
      name: ['', Validators.required],
      icon: ['', Validators.required],
    });

    this.speciesId = this._route.snapshot.paramMap.get('id')!;
    console.log('speciesId', this.speciesId);
    
    this._petSpeciesService.getOne(this.speciesId).subscribe({
      next: (species: PetSpecies) => {
        this.speciesForm.patchValue({
          name: species.name,
          icon: species.icon,
        });
      },
      error: err => {
        console.error(err);
      }
    });
  }

  submit() {
    if (this.speciesForm.invalid) return;

    this.loading = true;
    const updatedSpecies = {
      _id: this.speciesId,
      ...this.speciesForm.value
    };

    this._petSpeciesService.updateOne(updatedSpecies).subscribe({
      next: () => {
        this.loading = false;
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
        this.loading = false;
      }
    });
  }
}