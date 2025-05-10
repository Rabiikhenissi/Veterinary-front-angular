import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PetSpecies } from 'app/shared/models/petSpecies';
import { Product } from 'app/shared/models/product';
import { PetSpeciesService } from 'app/shared/services/petSpecies.service';
import { ProductService } from 'app/shared/services/product.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit',
  imports: [CommonModule, FormsModule],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss'
})
export class EditComponent implements OnInit {
  _route = inject(ActivatedRoute);
  _router = inject(Router);
  _fb = inject(FormBuilder);
  _petSpeciesService = inject(PetSpeciesService);
  _productService = inject(ProductService);
  productForm!: FormGroup;
  id = this._route.snapshot.paramMap.get('id')!;
  categories = ['Medications', 'Accessories', 'Food', 'Hygiene', 'Medical Supplies'];
  
    species: PetSpecies[] = []; 
  
  get product() {
  return this.productForm?.value;
}
  getSpeciesImage(name: string): string | undefined {
    return this.species.find(s => s.name === name)?.icon;
  }
  ngOnInit(): void {
    this._productService.getOne(this.id).subscribe(product => {
      this.initForm(product);
    });
    this._petSpeciesService.getList().subscribe({
      next: (res) => {
        this.species = res.data;
      },
      error: (err) => {
        console.error('Failed to fetch species', err);
      }
    });
  }

  initForm(product: Product) {
    const formattedDate = product.expirationDate
    ? new Date(product.expirationDate).toISOString().split('T')[0]
    : '';
    this.productForm = this._fb.group({
      name: [product.name, Validators.required],
      category: [product.category, Validators.required],
      species: [product.species || []],
      quantity: [product.quantity, [Validators.required, Validators.min(0)]],
      price: [product.price, [Validators.required, Validators.min(0)]],
      expirationDate: [formattedDate],
      description: [product.description || ''],
      image: [product.image],
      limitPerUser: [product.limitPerUser || 0],
    });
  }

  onSubmit() {
    if (this.productForm.valid) {
      const updated = { ...this.productForm.value, _id: this.id };
      this._productService.updateOne(updated).subscribe(() => {
        Swal.fire({
                            icon: 'success',
                            title: 'Success!',
                            text: 'Product updated successfully.',
                              timer: 1000,
                              showConfirmButton: false,
                          }).then(() => {
                            this._router.navigate([`../..`], { relativeTo: this._route }).then();        });
      });
    }
  }
  cancel() {
    this._router.navigate([`../..`], { relativeTo: this._route }).then();  }
  toggleSpecies(spec: string) {
    const current = this.productForm.get('species')?.value || [];
    const index = current.indexOf(spec);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(spec);
    }
    this.productForm.get('species')?.setValue([...current]);
  }
  onFileSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.productForm.get('image')?.setValue(reader.result as string);
      };
      reader.readAsDataURL(file); 
    }
  }
}