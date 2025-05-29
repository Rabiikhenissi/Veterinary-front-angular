import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from 'app/shared/models/product';
import { LoadingService } from 'app/shared/services/loading.service';
import { ProductService } from 'app/shared/services/product.service';
import { getImageUrl } from 'app/shared/utils/image-utils';

@Component({
  selector: 'app-details',
  imports: [CommonModule, FormsModule],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss'
})
export class DetailsComponent implements OnInit {
  _loadingService = inject(LoadingService);
_productService = inject(ProductService);
  _route = inject(ActivatedRoute);
  _router = inject(Router);
  id = this._route.snapshot.paramMap.get('id')!;
  product!: Product;
  species = [
    { name: 'Dog', image: 'assets/images/avatars/pets/dog.png' },
    { name: 'Cat', image: 'assets/images/avatars/pets/cat.png' },
    { name: 'Rabbit', image: 'assets/images/avatars/pets/rabbit.png' },
    { name: 'Fish', image: 'assets/images/avatars/pets/fish.png' },
    { name: 'Turtle', image: 'assets/images/avatars/pets/turtle.png' },
    { name: 'Monkey', image: 'assets/images/avatars/pets/monkey.png' }
  ];
  getSpeciesImage(name: string): string | undefined {
    return this.species.find(s => s.name === name)?.image;
  }
  getProductImageUrl(imagePath: string): string {
    const url = getImageUrl(imagePath);
    return url;
  }
  ngOnInit(): void {
    this._loadingService.show();
    this._productService.getOne(this.id).subscribe({
      next: (data) => {
        this.product = data;
        this._loadingService.hide();        
      },
      error: () => this._loadingService.hide()
    });
  }

}
