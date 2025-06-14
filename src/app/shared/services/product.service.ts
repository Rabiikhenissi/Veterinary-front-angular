import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Product } from '../models/product';
import { Pagination } from '../models/pagination';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
endpoint = `${environment.api}/products`; // API endpoint for pets
  http = inject(HttpClient);
  getList(
      limit: string,
      page: string,
      search: string,
      category?: string,
      species?: string,
      archive?:string 
    ): Observable<Pagination<Product>> {
      let searchParams = new HttpParams();
      searchParams = searchParams.append('limit', limit);
      searchParams = searchParams.append('page', page);

      if (category) {
        searchParams = searchParams.append('category', category);
      }
      if (species) {
        searchParams = searchParams.append('species', species);
      }
      if (search) {
        searchParams = searchParams.append('search', search);
      }
      if (archive) {
        searchParams = searchParams.append('archive', archive);
      }
      return this.http.get<Pagination<Product>>(`${this.endpoint}`, { params: searchParams });
    }

archiveOne(id: string): Observable<Product> {
    return this.http.patch<Product>(`${this.endpoint}/archive/${id}`,{});
  }
  deleteOne(id: string): Observable<null> {
    return this.http.delete<null>(`${this.endpoint}/${id}`);
  }

  // Get a product 
  getOne(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.endpoint}/${id}`,);
  }

    createOne(product: Product): Observable<null> {
      return this.http.post<null>(`${this.endpoint}/`,  product);
    }
    // Update an existing pet
      updateOne(product: Product): Observable<null> {
        return this.http.patch<null>(`${this.endpoint}/${product._id}`,  product );
      }
uploadImage(file: File): Observable<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<{ imageUrl: string }>(`${this.endpoint}/upload-image`, formData);
  }
}
