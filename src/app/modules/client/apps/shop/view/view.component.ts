import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, Input, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from 'app/shared/models/product';
import { CartService } from 'app/shared/services/cart.service';
import { ProductService } from 'app/shared/services/product.service';
import { CartSidebarComponent } from "../cart-sidebar/cart-sidebar.component";
import Swal from 'sweetalert2';
import { getImageUrl } from 'app/shared/utils/image-utils';
import { LoadingService } from 'app/shared/services/loading.service';

@Component({
  selector: 'app-view',
  imports: [CommonModule, FormsModule, CartSidebarComponent],
  templateUrl: './view.component.html'
})
export class ViewComponent {
  product: Product ;
  quantity: number = 1;
  recommendedProducts: Product[] = [];;
  searchQuery: string = '';
  currentPage = 1;
  total = 0;
  currentSize = 99999999; // Large enough to fetch all products
  _loadingService = inject(LoadingService);
@ViewChild('slider', { static: false }) slider: ElementRef<HTMLDivElement>;
isAddingToCart = false;
  route=inject(ActivatedRoute);
  _productService = inject(ProductService);
  _cartService = inject(CartService);
  router=inject(Router);
  constructor() {
    this._cartService.cart$.subscribe(c => this.cart = c);
  }
  cart: any;
  
  getTotalItems(): number {
    return this.cart?.products?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
  }

  getProductImageUrl(imagePath: string): string {
    const url = getImageUrl(imagePath);
    return url;
  }
@ViewChild(CartSidebarComponent) sidebar!: CartSidebarComponent;
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
    const id = params.get('id');
      if (id) {
        this.loadProduct(id);
      }
    });
    
  }

  scrollRecommendations(direction: 'left' | 'right') {
  const el = this.slider?.nativeElement;
  if (!el) return;
  const scrollAmount = 260; // Adjust based on card width + gap
  el.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
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
    if (this.isAddingToCart) {
      Swal.fire({
        icon: 'info',
        title: 'Please wait',
        text: 'You are clicking too fast. Please wait for the previous action to complete.',
        confirmButtonColor: '#f87171',
      });
      return; // Prevent double click
    }
    this.isAddingToCart = true;
    this._cartService.addToCart(this.product._id, this.quantity).subscribe({
      next: () => {
        this._cartService.fetchCart();
        this.isAddingToCart = false;
      },
      error: (error) => {
        this.isAddingToCart = false;
        console.error('Error adding to cart:', error);
        if (error.status == 409) {
                  Swal.fire({
                    icon: 'warning',
                    title: 'Cannot add more',
                    text: 'Requested quantity exceeds available stock',
                    confirmButtonColor: '#f87171',
                  });
                } else if (error.status == 422) {
                  Swal.fire({
                    icon: 'warning',
                    title: 'Limit Reached',
                    text: 'You cannot purchase more of this product due to the per-user limit',
                    confirmButtonColor: '#f87171',
                  });
                
                } else {
                  Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Something went wrong while updating the quantity.',
                    confirmButtonColor: '#f87171',
                  });
                }
      }
    });
  }

  loadRecommendedProducts(): void {
    this._productService.getList(
      this.currentSize.toString(),
      this.currentPage.toString(),
      this.searchQuery,
    'Food,Accessories,Hygiene', 
    undefined,
    'false'
    ).subscribe({
      next: (response) => {
        this._loadingService.show();
      
        const products = response.data;

        this.recommendedProducts = products.filter(prod =>
          prod._id !== this.product._id &&
          (
            prod.category === this.product.category ||
            (Array.isArray(prod.species) &&
              Array.isArray(this.product.species) &&
              prod.species.some(s => this.product.species.includes(s)))
          )
        );
        this._loadingService.hide();
        
      },
      error: (error) => {
        console.error('Error loading recommended products:', error);
        this._loadingService.hide();
      }})
  }

    loadProduct(id: string): void {
      this._loadingService.show();
      this._productService.getOne(id).subscribe(
        { next:(product)=> {
        this.product = product;
        this.quantity = 1;
        this.loadRecommendedProducts();
    },
    error: (error) => {
        console.error('Error loading product:', error);
        this._loadingService.hide();
        
      }
  });
    }

  viewProduct(productId: string): void {
    
    this.router.navigate(['..', productId], { relativeTo: this.route }); 
  }


}
