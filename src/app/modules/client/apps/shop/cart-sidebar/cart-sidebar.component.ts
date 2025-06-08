import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { CartService } from 'app/shared/services/cart.service';
import { LoadingService } from 'app/shared/services/loading.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-cart-sidebar',
  imports: [CurrencyPipe,CommonModule],
  templateUrl: './cart-sidebar.component.html',
  styleUrl: './cart-sidebar.component.scss'
})
export class CartSidebarComponent {
  _loadingService = inject(LoadingService);
  isOpen = false;
  cart: any;
  constructor(public cartService: CartService) {
    this.cartService.cart$.subscribe(c => {
      this.cart = c;
      
    });
    this.cartService.fetchCart();
  }

  toggleCart() {
    this.isOpen = !this.isOpen;
    
  }
  trackByIndex(index: number) {
    return index;
  }

  increaseQuantity(item: any) {
    // Check if quantity exceeds the user's limit
    if (item.quantity >= item.productId.limit) {
      // Alert user that the limit is reached
      Swal.fire({
        icon: 'warning',
        title: 'Limit Reached',
        text: `You cannot purchase more than ${item.productId.limit} of this product.`,
        confirmButtonColor: '#f87171',
      });
      return; // Prevent further increase if limit is reached
    }
    this._loadingService.show(); // Show loading indicator
    // Proceed to update the quantity if the limit is not reached
    this.cartService.updateQuantity(item.productId._id, item.quantity + 1).subscribe({
      next: () => {
        this.cartService.fetchCart(); // Refresh the cart after updating quantity
        this._loadingService.hide(); // Hide loading indicator
      },
      error: (error) => {
        this._loadingService.hide(); // Hide loading indicator
        console.error('Error updating quantity:', error);
  
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
  
  
  
  
  decreaseQuantity(item: any) {

    this._loadingService.show(); // Show loading indicator
    if (item.quantity > 1) {
      this.cartService.updateQuantity(item.productId._id, item.quantity - 1).subscribe({
        next: () => {
          this.cartService.fetchCart(); // Refresh the cart after updating quantity
          this._loadingService.hide(); // Hide loading indicator
        },
        error: (error) => {
          this._loadingService.hide(); // Hide loading indicator
          console.error('Error updating quantity:', error);
        }
      })
    } else {
      this.cartService.removeFromCart(item.productId._id).subscribe({
        next: () => {
          this.cartService.fetchCart(); // Refresh the cart after removing item
          this._loadingService.hide(); // Hide loading indicator
        },
        error: (error) => {
          this._loadingService.hide(); // Hide loading indicator
          console.error('Error removing item:', error);
        }
      }); // Optional: remove if quantity hits 0
    }
  }
  

  closeCart() {
    this.isOpen = false;
  }

  get totalPrice(): number {
    if (!this.cart?.products?.length) return 0;
    return this.cart.products.reduce(
      (sum: number, item: any) => sum + item.quantity * item.productId.price,0);
  }


  clearCart() {
    this._loadingService.show(); // Show loading indicator
    this.cartService.clearCart().subscribe({
      next: () => {this.cartService.fetchCart()
        this._loadingService.hide(); // Hide loading indicator
      },
      error: (err) => {
        this._loadingService.hide(); // Hide loading indicator
        console.error('Error clearing cart:', err);
      }
    });
  }

  removeItem(item: any) {
    this._loadingService.show(); // Show loading indicator
    this.cartService.removeFromCart(item.productId._id).subscribe({
      next: () => {
        this.cartService.fetchCart();
        this._loadingService.hide(); // Hide loading indicator
      },
      error: (err) => {
        this._loadingService.hide(); // Hide loading indicator
        console.error('Error removing item:', err);
      }
    });
  }
  confirmPurchase() {
    this._loadingService.show();
    this.cartService.confirmPurchase().subscribe({
      next: (pdfBlob: Blob) => {
        this._loadingService.hide();
        Swal.fire({
          icon: 'success',
          title: 'Purchase Confirmed',
          text: 'Your invoice has been Created!',
          confirmButtonColor: '#38a169',
        });
          const pdfUrl = URL.createObjectURL(pdfBlob);
          window.open(pdfUrl, '_blank');
          this.clearCart();
          this.cartService.fetchCart();
          this.closeCart();
      },
      error: (error) => {
        this._loadingService.hide();
        Swal.fire({
          icon: 'error',
          title: 'Purchase Failed',
          text: 'Something went wrong while generating the invoice.',
          confirmButtonColor: '#e53e3e',
        });
        console.error('Error confirming purchase:', error);
      }
    });
  }
}
