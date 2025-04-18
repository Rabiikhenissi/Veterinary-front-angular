import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { FilterOptions } from 'app/shared/models/filter-options';
import { Pagination } from 'app/shared/models/pagination';
import { Product } from 'app/shared/models/product';
import { CartService } from 'app/shared/services/cart.service';
import { ProductService } from 'app/shared/services/product.service';

@Component({
  selector: 'app-shop',
  imports: [MatPaginator,CommonModule,FormsModule],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss'
})
export class ShopComponent {
  //********* INJECT SERVICES ***********//
  route = inject(ActivatedRoute);
  _cartService = inject(CartService);
  _productService = inject(ProductService);
  router=inject(Router);
  products: Product[] = [];
  categories: string[] = ["Medications", "Accessories", "Food", "Hygiene", "Medical Supplies"];
  currentPage = 1;
  total = 0;
  currentSize = 10;
  //species list is static now but will be dynalmic in the future depending on the pets of the company
  speciesList: string[] = ['Cat', 'Dog', 'Rabbit', 'fish','turtle','monkey'];
  selectedSpecies: string[] = [];
   filterOptions: FilterOptions = new FilterOptions();
    typingTimer;
    doneTypingInterval = 500;
    filterSearch: string;
  selectedCategories: string[] = [];

  searchQuery: string = '';
  

  @ViewChild(MatPaginator) paginator: MatPaginator;
  ngOnInit(): void {
    this.fetchProducts();
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
          this.products = results.data;
          this.total = results.total;
          console.log(this.products);
          
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
    console.log(productId)
    this.router.navigate([ productId], { relativeTo: this.route }); 
  }

  addToCart(product: any) {
    this._cartService.addToCart(product._id, 1).subscribe({
      next: (response) => {
        console.log('Product added to cart:', response);
      }
      , error: (error) => {
        console.error('Error adding product to cart:', error);
      }
    });
  }
}
