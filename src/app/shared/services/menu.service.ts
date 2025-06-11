import {inject, Injectable} from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  endpoint = `${environment.api}/menus`;
  private _features$ = new BehaviorSubject<any[]>([]);
  public features$ = this._features$.asObservable();

  http = inject(HttpClient)

  getMenu(): Observable<any> {
    return this.http.get<any>(`${this.endpoint}`).pipe(
      tap((data) => {
        this._features$.next(data.features);  // <- IMPORTANT
      })
    );
  }

  getFeatures() {
    return this._features$.getValue();
  }
}
