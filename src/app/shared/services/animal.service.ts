import {inject, Injectable} from '@angular/core';
import { Company } from '../models/company';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pagination } from '../models/pagination';
import { Animal } from '../models/animal';
@Injectable({
  providedIn: 'root',
})
export class AnimalService {
  endpoint = `${environment.api}/animals`; // API endpoint for animals
  http = inject(HttpClient);

  // Get list of animals
  getList(
    limit: string,
    page: string,
    search: string
  ): Observable<Pagination<Animal>> {
    let searchParams = new HttpParams();
    searchParams = searchParams.append('limit', limit);
    searchParams = searchParams.append('page', page);
    if (search) {
      searchParams = searchParams.append('search', search);
    }
    return this.http.get<Pagination<Animal>>(`${this.endpoint}`, { params: searchParams });
  }

  // Get all animals 


  // Delete an animal 
  deleteOne(id: string): Observable<null> {
    return this.http.delete<null>(`${this.endpoint}/${id}`);
  }

  // Get an animal 
  getOne(id: string): Observable<Animal> {
    return this.http.get<Animal>(`${this.endpoint}/${id}`);
  }

  // Create a new animal
  createOne(animal: Animal): Observable<null> {
    return this.http.post<null>(`${this.endpoint}`, { animal });
  }

  // Update an existing animal
  updateOne(animal: Animal): Observable<null> {
    return this.http.patch<null>(`${this.endpoint}/${animal._id}`, { animal });
  }
}