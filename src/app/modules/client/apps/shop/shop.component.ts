import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { FilterOptions } from 'app/shared/models/filter-options';
import { Pagination } from 'app/shared/models/pagination';
import { Product } from 'app/shared/models/product';
import { CartService } from 'app/shared/services/cart.service';
import { ProductService } from 'app/shared/services/product.service';
import { CartSidebarComponent } from './cart-sidebar/cart-sidebar.component';
import Swal from 'sweetalert2';
import { PetSpeciesService } from 'app/shared/services/petSpecies.service';
import { PetSpecies } from 'app/shared/models/petSpecies';
import { getImageUrl } from 'app/shared/utils/image-utils';
import { LoadingService } from 'app/shared/services/loading.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-shop',
  imports: [MatPaginator,CommonModule,FormsModule,CartSidebarComponent],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss'
})
export class ShopComponent implements OnInit{
  //********* INJECT SERVICES ***********//
  route = inject(ActivatedRoute);
  _cartService = inject(CartService);
  _productService = inject(ProductService);
  _petSpeciesService = inject(PetSpeciesService);
  _loadingService = inject(LoadingService);
  router=inject(Router);
  isAddingToCart: { [productId: string]: boolean } = {};
  products: Product[] = [];
  categories: string[] = [ "Accessories", "Food", "Hygiene"];
  currentPage = 1;
  total = 0;
  currentSize = 10;
  //species list is static now but will be dynalmic in the future depending on the pets of the company
  speciesList: PetSpecies[] = []; 
  selectedSpecies: string[] = [];
   filterOptions: FilterOptions = new FilterOptions();
    typingTimer;
    doneTypingInterval = 500;
    filterSearch: string;
  selectedCategories: string[] = [];

  searchQuery: string = '';

  cart: any;
  
  
  getTotalItems(): number {
    return this.cart?.products?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
  }
  @ViewChild(CartSidebarComponent) sidebar!: CartSidebarComponent;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  ngOnInit(): void {
    this._loadingService.show();
    this._cartService.cart$.subscribe(c => { this.cart = c; });
    forkJoin({
      products: this._productService.getList(
        this.currentSize.toString(),
        this.currentPage.toString(),
        this.searchQuery,
        this.selectedCategories.join(','),
        this.selectedSpecies.join(','),
        'false'
      ),
      species: this._petSpeciesService.getList(localStorage.getItem('connectedCompanyId')),
      
    }).subscribe({
      next: ({ products, species }) => {
        this.products = products.data.filter(product =>
          this.categories.includes(product.category)
        );
        this.total = this.products.length;
      this.speciesList = species.data;
      this._loadingService.hide();
    },
    error: (err) => {
      this._loadingService.hide();
      console.error('Failed to fetch products or species', err);
    }
  });
}
getProductImageUrl(imagePath: string): string {
  const url = getImageUrl(imagePath);
  return url;
}
  fetchProducts(): void {
    
    this._productService
      .getList(
        this.currentSize.toString(),
        this.currentPage.toString(),
        this.searchQuery,
        this.selectedCategories.join(','),
        this.selectedSpecies.join(',')
      )
      .subscribe(({
        next: results => {
          this.products = results.data.filter(product => 
            this.categories.includes(product.category)
          );
          this.total = this.products.length;
          
        },
        error: (error) => {
          console.error('Error fetching products:', error);
        }
      }));
  }

  onSearchChange() {
    clearTimeout(this.typingTimer);
    this.filterOptions.search = this.filterSearch;
    this.typingTimer = setTimeout(() => {
      this.paginator?.firstPage();
      this.fetchProducts();
    }, this.doneTypingInterval);
  }

  

  toggleSpecies(species: string): void {
    const index = this.selectedSpecies.indexOf(species);
    if (index > -1) {
      this.selectedSpecies.splice(index, 1);
    } else {
      this.selectedSpecies.push(species);
    }
    this.currentPage = 1;
    this.fetchProducts();
  }
  
  

  onCategoryToggle(category: string): void {
    const index = this.selectedCategories.indexOf(category);
    if (index > -1) {
      this.selectedCategories.splice(index, 1);
    } else {
      this.selectedCategories.push(category);
    }
    this.currentPage = 1;
    this.fetchProducts();
  }

  pageChanged(event: any): void {
    let { pageIndex } = event;
    const { pageSize } = event;
      pageIndex++;
      if (pageSize !== this.currentSize) {
        pageIndex = 1;
        this.paginator.firstPage();
      }
      this.currentSize = pageSize;
      this.currentPage = pageIndex;
      
    this.fetchProducts();
  }

  viewProduct(productId: string): void {
    this.router.navigate([ productId], { relativeTo: this.route }); 
  }

  addToCart(product: any) {
    // Check if product has a limitPerClient and if it's exceeded in the cart
    const cartItem = this.cart?.products?.find((item: any) => item.productId === product._id);
    const currentQuantity = cartItem ? cartItem.quantity : 0;
    const limitPerClient = product.limitPerClient;
if (this.isAddingToCart[product._id]) {
      Swal.fire({
        icon: 'info',
        title: 'Please wait',
        text: 'You are clicking too fast. Please wait for the previous action to complete.',
        confirmButtonColor: '#f87171',
      });
      return; // Prevent double click
    }
    if (limitPerClient && currentQuantity >= limitPerClient) {
      Swal.fire({
        icon: 'warning',
        title: 'Limit Reached',
        text: 'You cannot purchase more of this product due to the limit per client',
        confirmButtonColor: '#f87171',
      });
      return;
    }
    
this.isAddingToCart[product._id] = true;
this._loadingService.show();
    this._cartService.addToCart(product._id, 1).subscribe({
      next: (response) => {
        this.sidebar.cartService.fetchCart(); // Refresh the cart after adding product
        this.isAddingToCart[product._id] = false; // Reset the adding state
        this._loadingService.hide();
      },
      error: (error) => {
        this._loadingService.hide();
        console.error('Error updating quantity:', error);
        this.isAddingToCart[product._id] = false; // Reset the adding state

        if (error.status === 409) {
          Swal.fire({
            icon: 'warning',
            title: 'Cannot add more',
            text: 'Requested quantity exceeds available stock',
            confirmButtonColor: '#f87171',
          });
        } else if (error.status === 422) {
          Swal.fire({
            icon: 'warning',
            title: 'Limit Reached',
            text: 'You cannot purchase more of this product due to the limit per client',
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
}
