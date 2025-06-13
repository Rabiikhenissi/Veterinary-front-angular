import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PetSpecies } from 'app/shared/models/petSpecies';
import { Product } from 'app/shared/models/product';
import { LoadingService } from 'app/shared/services/loading.service';
import { PetSpeciesService } from 'app/shared/services/petSpecies.service';
import { ProductService } from 'app/shared/services/product.service';
import { getImageUrl } from 'app/shared/utils/image-utils';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-details',
  imports: [CommonModule, FormsModule],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss'
})
export class DetailsComponent implements OnInit {
  _loadingService = inject(LoadingService);
_productService = inject(ProductService);
_petSpeciesService = inject(PetSpeciesService);

  _route = inject(ActivatedRoute);
  _router = inject(Router);
  id = this._route.snapshot.paramMap.get('id')!;
  product!: Product;
    speciesOptions: PetSpecies[] = []; 

  
  getProductImageUrl(imagePath: string): string {
    const url = getImageUrl(imagePath);
    return url;
  }
ngOnInit(): void {
  this._loadingService.show();

  forkJoin({
    product: this._productService.getOne(this.id),
    species: this._petSpeciesService.getList(localStorage.getItem('connectedCompanyId'))
  }).subscribe({
    next: ({ product, species }) => {
      this.product = product;
      this.speciesOptions = species.data; 
      this._loadingService.hide();
      console.log('Product:', this.product);
      console.log('Species options:', this.speciesOptions);
    },
    error: (err) => {
      console.error('Error in forkJoin:', err);
      this._loadingService.hide();
    }
  });

  }
getSpeciesIcon(species: string) {
    const speciesData = this.speciesOptions.find(s => s.name === species);
    return speciesData ? speciesData.icon : 'assets/icons/default-species-icon.png';    
    
}
}
