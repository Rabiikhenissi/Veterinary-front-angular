import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from 'app/shared/models/product';
import { CartService } from 'app/shared/services/cart.service';
import { ProductService } from 'app/shared/services/product.service';

@Component({
  selector: 'app-view',
  imports: [CommonModule,FormsModule],
  templateUrl: './view.component.html'
})
export class ViewComponent {
  product: Product ;
  quantity: number = 1;
  recommendedProducts: Product[] = [];;
  searchQuery: string = '';
  currentPage = 1;
  total = 0;
  currentSize = 10;

  route=inject(ActivatedRoute);
  _productService = inject(ProductService);
  _cartService = inject(CartService);
  router=inject(Router);
 

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
    const id = params.get('id');
      if (id) {
        this.loadProduct(id);
      }
    });
    
  }

  increaseQty() {
    this.quantity++;
  }

  decreaseQty() {
    if (this.quantity > 1) this.quantity--;
  }

  onQuantityChange() {
    if (this.quantity < 1 || isNaN(this.quantity)) {
      this.quantity = 1;
    }
  }

  addToCart() {
    this._cartService.addToCart(this.product._id, this.quantity);
  }

  loadRecommendedProducts(): void {
    this._productService.getList(
      this.currentSize.toString(),
      this.currentPage.toString(),
      this.searchQuery,
      this.product.category,
      this.product.species.join(',')).subscribe(response => {
        const products = response.data;
    
        this.recommendedProducts = products.filter(prod =>
          prod._id !== this.product._id &&
          prod.category === this.product.category &&
          Array.isArray(prod.species) &&
          Array.isArray(this.product.species) &&
          prod.species.some(s => this.product.species.includes(s))
        );
      });
    }

    loadProduct(id: string): void {
      this._productService.getOne(id).subscribe(product => {
        this.product = product;
        this.quantity = 1;
        this.loadRecommendedProducts(); 
      });
    }

  viewProduct(productId: string): void {
    console.log(productId)
    this.router.navigate(['..', productId], { relativeTo: this.route }); 
  }


}
