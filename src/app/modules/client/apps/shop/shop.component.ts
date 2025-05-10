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
  
  router=inject(Router);
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
  constructor() {
    this._cartService.cart$.subscribe(c => this.cart = c);
  }
  cart: any;
  
  
  getTotalItems(): number {
    return this.cart?.products?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
  }
  @ViewChild(CartSidebarComponent) sidebar!: CartSidebarComponent;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  ngOnInit(): void {
    this.fetchProducts();
    this._petSpeciesService.getList().subscribe({
      next: (res) => {
        this.speciesList = res.data;
      },
      error: (err) => {
        console.error('Failed to fetch species', err);
      }
    });
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
    this._cartService.addToCart(product._id, 1).subscribe({
      next: (response) => {
        
        this.sidebar.cartService.fetchCart(); // Refresh the cart after adding product
        
      }
      , error: (error) => {
        console.error('Error updating quantity:', error);
  
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
