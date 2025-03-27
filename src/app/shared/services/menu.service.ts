import {inject, Injectable} from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  endpoint = `${environment.api}/menus`;

  http = inject(HttpClient)

  getMenu(): Observable<any> {
    return this.http.get<any>(`${this.endpoint}`);
  }
}
