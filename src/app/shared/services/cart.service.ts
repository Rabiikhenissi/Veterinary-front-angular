import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Cart } from '../models/cart';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
endpoint = `${environment.api}/cart`;
private cartItemCount = new BehaviorSubject<number>(0);
cartItemCount$ = this.cartItemCount.asObservable();

private cart = new BehaviorSubject<any>(null);
cart$ = this.cart.asObservable();

  constructor(private http: HttpClient) {}

  getCart(): Observable<Cart> {
    return this.http.get<Cart>(`${this.endpoint}/`);
  }

  addToCart( productId: string, quantity: number): Observable<Cart> {
    return this.http.post<Cart>(`${this.endpoint}`, { productId, quantity });
  }

  removeFromCart( productId: string): Observable<Cart> {
    return this.http.delete<Cart>(`${this.endpoint}`, {body: {  productId }});
  }

  clearCart(): Observable<any> {
    return this.http.delete(`${this.endpoint}/clear`);
  }

  fetchCart() {
    this.http.get<any>(this.endpoint).subscribe(data => {
      this.cart.next(data);
      const totalItems = data.products?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
      this.cartItemCount.next(totalItems);
    });
  }

updateQuantity(productId: string, quantity: number): Observable<Cart> {
    return this.http.put<Cart>(`${this.endpoint}`, { productId, quantity });
  }


}
