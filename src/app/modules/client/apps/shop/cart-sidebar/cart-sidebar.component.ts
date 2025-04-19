import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component } from '@angular/core';
import { CartService } from 'app/shared/services/cart.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-cart-sidebar',
  imports: [CurrencyPipe,CommonModule],
  templateUrl: './cart-sidebar.component.html',
  styleUrl: './cart-sidebar.component.scss'
})
export class CartSidebarComponent {
  
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
    
    this.cartService.updateQuantity(item.productId._id, item.quantity + 1).subscribe({
      next: () => {
        this.cartService.fetchCart(); // Refresh the cart after updating quantity
      },
      error: (error) => {
        console.error('Error updating quantity:', error);
         Swal.fire({
                        icon: 'warning',
                        title: 'Cannot add more',
                        text: 'Requested quantity exceeds available stock',
                        confirmButtonColor: '#f87171',
                    });
      }
    })
  }
  
  decreaseQuantity(item: any) {
    if (item.quantity > 1) {
      this.cartService.updateQuantity(item.productId._id, item.quantity - 1).subscribe({
        next: () => {
          this.cartService.fetchCart(); // Refresh the cart after updating quantity
        },
        error: (error) => {
          console.error('Error updating quantity:', error);
        }
      })
    } else {
      this.cartService.removeFromCart(item.productId._id).subscribe({
        next: () => {
          this.cartService.fetchCart(); // Refresh the cart after removing item
        },
        error: (error) => {
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
    this.cartService.clearCart().subscribe({
      next: () => this.cartService.fetchCart(),
      error: (err) => console.error('Error clearing cart:', err)
    });
  }

  removeItem(item: any) {
    this.cartService.removeFromCart(item.productId._id).subscribe({
      next: () => this.cartService.fetchCart(),
      error: (err) => console.error('Error removing item:', err)
    });
  }
  confirmPurchase() {
    this.cartService.confirmPurchase().subscribe({
      next: (pdfBlob: Blob) => {
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
      },
      error: (error) => {
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
