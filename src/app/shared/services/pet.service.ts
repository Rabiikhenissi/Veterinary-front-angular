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
    search: string,
    userId?: string,
    species?: string[],
    archived?: boolean
  ): Observable<Pagination<Pet>> {
    let searchParams = new HttpParams()
      .set('limit', limit)
      .set('page', page);

    if (userId) searchParams = searchParams.set('userId', userId);
    if (search) searchParams = searchParams.set('search', search);
    if (species && species.length > 0) {
      species.forEach(s => {
        searchParams = searchParams.append('species', s);
      });
    }
    if (archived !== undefined) searchParams = searchParams.set('archived', archived.toString());

    return this.http.get<Pagination<Pet>>(`${this.endpoint}`, { params: searchParams });
  }

  // Get all pets 


  // Delete an pet 
  deleteOne(id: string): Observable<null> {
    return this.http.delete<null>(`${this.endpoint}/${id}`);
  }

  // Get an pet 
  getOne(id: string): Observable<Pet> {
    return this.http.get<Pet>(`${this.endpoint}/${id}`,);
  }

  // Create a new pet
  createOne(pet: Pet): Observable<null> {
    return this.http.post<null>(`${this.endpoint}/create`, { pet });
  }

  //create a new pet from secretary
  createOneSecretary(pet: Pet): Observable<null> {
    return this.http.post<null>(`${this.endpoint}`, { pet });
  }
  // Update an existing pet
  updateOne(pet: Pet): Observable<null> {
    return this.http.patch<null>(`${this.endpoint}/${pet._id}`, { pet });
  }
  getClientPet(petId:string, id:string): Observable<Pet> {
    return this.http.get<Pet>(`${this.endpoint}/${petId}/${id}`, {
    });
  }

  requestArchive(petId: string): Observable<any> {
  return this.http.patch(`${this.endpoint}/${petId}/request-archive`, {});
}

cancelArchiveRequest(petId: string): Observable<any> {
  return this.http.patch(`${this.endpoint}/${petId}/cancel-archive-request`, {});
}
 Archive(petId: string): Observable<any> {
    return this.http.patch(`${this.endpoint}/${petId}/archive`, {});
  }

  
  requestRestore(petId: string): Observable<any> {
    return this.http.patch(`${this.endpoint}/${petId}/request-restore`, {});
  }

  // Cancel restore request
  cancelRestoreRequest(petId: string): Observable<any> {
    return this.http.patch(`${this.endpoint}/${petId}/cancel-restore-request`, {});
  }
  restoreOne(petId: string): Observable<any> {
    return this.http.patch(`${this.endpoint}/${petId}/restore`, {});
  }

}