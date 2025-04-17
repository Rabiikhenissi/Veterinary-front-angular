import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Cart } from '../models/cart';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
endpoint = `${environment.api}/cart`;

  constructor(private http: HttpClient) {}

  getCart(userId: string): Observable<Cart> {
    return this.http.get<Cart>(`${this.endpoint}/${userId}`);
  }

  addToCart(userId: string, productId: string, quantity: number): Observable<Cart> {
    return this.http.post<Cart>(`${this.endpoint}`, { userId, productId, quantity });
  }

  removeFromCart(userId: string, productId: string): Observable<Cart> {
    return this.http.delete<Cart>(`${this.endpoint}`, {body: { userId, productId }});
  }

  clearCart(): Observable<any> {
    return this.http.delete(`${this.endpoint}/clear`);
  }
}
