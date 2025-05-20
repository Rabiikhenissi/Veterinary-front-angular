import {inject, Injectable} from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pagination } from '../models/pagination';
import { PetSpecies } from '../models/petSpecies';

@Injectable({
  providedIn: 'root',
})
export class PetSpeciesService {
  endpoint = `${environment.api}/petSpecies`;
    http = inject(HttpClient);

  getList(companyId: string, limit?: string, page?: string, search?: string): Observable<Pagination<PetSpecies>> {
    let params = new HttpParams();
    if (companyId) params = params.append('companyId', companyId);
    if (limit) params = params.append('limit', limit);
    if (page) params = params.append('page', page);
    if (search) params = params.append('search', search);

    return this.http.get<Pagination<PetSpecies>>(this.endpoint, { params });
  }

  // Create one pet species
  createOne(species: PetSpecies): Observable<PetSpecies> {
    return this.http.post<PetSpecies>(this.endpoint,  species );
  }

  // Read one pet species
  getOne(id: string): Observable<PetSpecies> {
    return this.http.get<PetSpecies>(`${this.endpoint}/${id}`);
  }

  // Update one pet species
  updateOne(species: PetSpecies): Observable<PetSpecies> {
    return this.http.patch<PetSpecies>(`${this.endpoint}/${species._id}`, species);
  }

  // Delete one pet species
  archiveOne(id: string): Observable<PetSpecies> {
    return this.http.patch<PetSpecies>(`${this.endpoint}/archive/${id}`, {});
  }
 
}