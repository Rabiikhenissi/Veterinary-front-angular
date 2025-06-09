import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation/confirmation.service';
import { FilterOptions } from 'app/shared/models/filter-options';
import { Product } from 'app/shared/models/product';
import { ProductService } from 'app/shared/services/product.service';
import Swal from 'sweetalert2';
import { FeatureCodes } from 'app/shared/enums/feature-codes';
import { FeatureActions } from 'app/shared/enums/feature-actions';
import { FeaturesDirective } from 'app/shared/directives/features.directive';
import { getImageUrl } from 'app/shared/utils/image-utils';
import { LoadingService } from 'app/shared/services/loading.service';

@Component({
  selector: 'app-list',
  imports: [MatPaginator,CommonModule,FormsModule,FeaturesDirective],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit {

  _productService = inject(ProductService);
  _router = inject(Router);
  _fuseConfirmationService = inject(FuseConfirmationService);
_route = inject(ActivatedRoute);
  products: Product[] = [];
  categories: string[] = ['Medications', 'Accessories', 'Food', 'Hygiene'];
  selectedCategories: string[] = [];
  lowStockOnly: boolean = false;
  searchQuery: string = '';
  featureCodes = FeatureCodes;
  featureActions = FeatureActions;
  currentPage = 1;
  total = 0;
  currentSize = 10;
  filterOptions: FilterOptions = new FilterOptions();
  typingTimer;
  doneTypingInterval = 500;
  filterSearch: string;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
_loadingService = inject(LoadingService);
  ngOnInit(): void {
    this.fetchProducts();
  }

  fetchProducts(): void {
    this._loadingService.show();
    this._productService
      .getList(
        this.currentSize.toString(),
        this.currentPage.toString(),
        this.searchQuery,
        this.selectedCategories.join(','),
        ''
      )
      .subscribe({
        next: results => {
          this.products = this.lowStockOnly
            ? results.data.filter(p => p.quantity < 5) 
            : results.data;
          this.total = results.total;
          this._loadingService.hide();
        },
        error: error => {
          console.error('Error fetching products:', error);
          this._loadingService.hide();
        }
      });
  }

getProductImageUrl(imagePath: string): string {
  const url = getImageUrl(imagePath);
  console.log('getProductImageUrl called with:', imagePath, '-> returns:', url);
  return url;
}
  onSearchChange() {
    clearTimeout(this.typingTimer);
    this.filterOptions.search = this.filterSearch;
    this.typingTimer = setTimeout(() => {
      this.paginator?.firstPage();
      this.fetchProducts();
    }, this.doneTypingInterval);
  }
  toggleCategory(category: string): void {
    const index = this.selectedCategories.indexOf(category);
    if (index > -1) this.selectedCategories.splice(index, 1);
    else this.selectedCategories.push(category);
    this.fetchProducts();
  }

  addNewProduct(): void {
    this._router.navigate(['add'], { relativeTo: this._route }).then();
  }
 
  editProduct(product: Product): void {
    this._router.navigate([`${product._id}/edit`], { relativeTo: this._route }).then();
  }

  archiveProduct(product): void {
          const confirmation = this._fuseConfirmationService.open({
        title: 'Archive Product',
        message: `Would you like to archive  ${product.name} ?`,
        actions: {
            confirm: {
                label: 'yes',
            },
            cancel: {
                label: 'no',
            },
        },
    });
    confirmation.afterClosed().subscribe((result) => {
        if (result === 'confirmed') {
          this._productService.archiveOne(product._id).subscribe({
            next: () => {
              console.log(`Product archived: ${product.name}`);
              
              this.fetchProducts();
            },
            error: (error) => {
              console.error('Archive Error:', error);
            }
          });
        }
    });
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
  updateStock(product: Product): void {
    if (product.quantity < 1) {
      Swal.fire({
        icon: 'info',
        title: 'Out Of Stock',
        text: `${product.name} is now out of stock.`,
        confirmButtonText: 'OK',
        customClass: {
          confirmButton: 'swal2-confirm bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded'
        },
        buttonsStyling: false
      });
    }
  
    const updatedProduct = { ...product, quantity: product.quantity };
    this._productService.updateOne(updatedProduct).subscribe({
      next: () => {
        console.log(`Stock updated for product: ${product.name}`);
        // No need to call fetchProducts() here unless stock affects filtering
      },
      error: (error) => {
        console.error('Error updating stock:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error updating stock',
          text: 'Please try again later',
          confirmButtonColor: '#ef4444',
        });
      }
    });
  }
  

  details(productId: string): void {
    this._router.navigate([`${productId}`], { relativeTo: this._route }).then();
  }
}


