import { A, C } from '@angular/cdk/keycodes';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { PetSpecies } from 'app/shared/models/petSpecies';
import { Product } from 'app/shared/models/product';
import { PetSpeciesService } from 'app/shared/services/petSpecies.service';
import { ProductService } from 'app/shared/services/product.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add',
  imports: [CommonModule, FormsModule,MatFormFieldModule,MatSelectModule,MatInputModule],
  templateUrl: './add.component.html',
  styleUrl: './add.component.scss'
})
export class AddComponent  {
  categories: string[] = ['Medications', 'Accessories', 'Food', 'Hygiene', 'Medical Supplies'];
 
_productService = inject(ProductService);
_petSpeciesService = inject(PetSpeciesService);

  _router = inject(Router);
  _route = inject(ActivatedRoute);
  product: Product = {
    name: '',
    category: '',
    species: [],
        price: null,
    quantity: null,
    image: '',
    limitPerUser: null,
  };
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
  selectSpecies(name: string) {
    if (name && name.trim()) {
      const index = this.product.species.indexOf(name);
      if (index > -1) {
        this.product.species.splice(index, 1); 
      } else {
        this.product.species.push(name); 
      }
    }
  }

  onCategoryChange() {
    if (this.product.category === 'Medical Supplies') {
      this.product.species = undefined;
    }
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.product.image = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  addProduct() {
    console.log(this.product);
    this._productService.createOne(this.product).subscribe(() => {Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Product added successfully.',
                      timer: 1000,
                      showConfirmButton: false,
                  }).then(() => {
                    this._router.navigate([`../`], { relativeTo: this._route }).then();        });
        }, (error) => {
          
          console.error(error);
          if (error.status === 400) {
            Swal.fire({
              icon: 'error',
              title: 'product already exists',
              text: 'Please check the product name,species and try again.',
              timer: 1000,
              showConfirmButton: false,
            });
          }
        });
      }
      
    }