import {inject, Injectable} from '@angular/core';
import { Company } from '../models/company';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pagination } from '../models/pagination';
import { Pet } from '../models/pet';
@Injectable({
  providedIn: 'root',
})
export class PetService {
  endpoint = `${environment.api}/pets`; // API endpoint for pets
  http = inject(HttpClient);

  // Get list of pets
  getList(
    limit: string,
    page: string,
    search: string
  ): Observable<Pagination<Pet>> {
    let searchParams = new HttpParams();
    searchParams = searchParams.append('limit', limit);
    searchParams = searchParams.append('page', page);
    if (search) {
      searchParams = searchParams.append('search', search);
    }
    return this.http.get<Pagination<Pet>>(`${this.endpoint}`, { params: searchParams });
  }

  // Get all pets 


  // Delete an pet 
  deleteOne(id: string): Observable<null> {
    return this.http.delete<null>(`${this.endpoint}/${id}`);
  }

  // Get an pet 
  getOne(id: string): Observable<Pet> {
    return this.http.get<Pet>(`${this.endpoint}/${id}`);
  }

  // Create a new pet
  createOne(pet: Pet): Observable<null> {
    return this.http.post<null>(`${this.endpoint}`, { pet });
  }

  // Update an existing pet
  updateOne(pet: Pet): Observable<null> {
    return this.http.patch<null>(`${this.endpoint}/${pet._id}`, { pet });
  }
}