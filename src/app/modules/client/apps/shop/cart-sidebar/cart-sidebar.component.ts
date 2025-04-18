import { Component } from '@angular/core';
import { CartService } from 'app/shared/services/cart.service';

@Component({
  selector: 'app-cart-sidebar',
  imports: [],
  templateUrl: './cart-sidebar.component.html',
  styleUrl: './cart-sidebar.component.scss'
})
export class CartSidebarComponent {
  isOpen = false;
  cart: any;

  constructor(public cartService: CartService) {
    this.cartService.cart$.subscribe(c => this.cart = c);
  }

  toggleCart() {
    this.isOpen = !this.isOpen;
  }

  closeCart() {
    this.isOpen = false;
  }
}
