import {inject, Injectable} from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { JwtPayload, jwtDecode } from 'jwt-decode';

import { environment } from '../../../environments/environment';
import { User } from '../models/user';
import { Pagination } from '../models/pagination';
import { map, tap } from 'rxjs/operators';
import { FeatureAuth } from '../models/feature-auth';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  endpointAuth = `${environment.api}/users`;
  keyAccessToken = 'access_token';
  _user = new BehaviorSubject<User | null>(null);
  _defaultLink = new BehaviorSubject<string | null>(null);
  _features: BehaviorSubject<FeatureAuth[] | null> = new BehaviorSubject<FeatureAuth[] | null>(
    null,
  );
    http = inject(HttpClient)
    router = inject(Router)

  set user(value: User) {
    // Store the value
    this._user.next(value);
  }
  get user$(): Observable<User | null> {
    return this._user.asObservable();
  }

  set defaultLink(value: string) {
    // Store the value
    this._defaultLink.next(value);
  }
  get defaultLink$(): BehaviorSubject<string | null> {
    return this._defaultLink;
  }

  set features(value: FeatureAuth[]) {
    // Store the value
    this._features.next(value);
  }

  get features$(): BehaviorSubject<FeatureAuth[] | null> {
    return this._features;
  }
  checkPermission(permissions: FeatureAuth[]): boolean {
    const featuresAuth: FeatureAuth[] | null = this.features$?.getValue();
    let permission: FeatureAuth;
    for (permission of permissions) {
      // eslint-disable-next-line @typescript-eslint/no-loop-func
      const fa = featuresAuth?.find((fau: FeatureAuth) => fau.code === permission.code);
      if (!fa) {
        return false;
      }
      let permissionAction;
      if (permission.actions) {
        for (permissionAction of permission.actions) {
          if (!fa.actions?.includes(permissionAction)) {
            return false;
          }
        }
      }
    }
    return true;
  }

  get(): Observable<User> {
    return this.http.get<User>(`${this.endpointAuth}/me`).pipe(
      tap((user) => {
        this._user.next(user);
      }),
    );
  }
  // ********************* Password & Code *************//
  changePassword(
    password: string,
    newPassword: string,
    code: string,
    id: string,
  ): Observable<null> {
    return this.http.post<null>(`${this.endpointAuth}/${id}/change-password`, {
      password,
      newPassword,
      code,
    });
  }
  checkPassword(password: string): Observable<null> {
    return this.http.post<null>(`${this.endpointAuth}/check-password`, {
      password,
    });
  }
  sendCode(id: string, password: string, newPassword: string): Observable<null> {
    return this.http.post<null>(`${this.endpointAuth}/${id}/send-code`, {
      password,
      newPassword,
    });
  }
  resendCode(id: string, params: any): Observable<null> {
    return this.http.patch<null>(`${this.endpointAuth}/${id}/resend-code`, {
      params,
    });
  }

  // ******************* My info **************************** //
  getUserProfile(): Observable<User> {
    return this.http.get<User>(`${this.endpointAuth}/me`);
  }
  updatePersonalInfo(user: User): Observable<User> {
    return this.http.post<User>(`${this.endpointAuth}/personal-info`, user);
  }
  updateMyAvatar(data: FormData): Observable<User> {
    return this.http.post<User>(`${this.endpointAuth}/my-avatar`, data).pipe(
      tap((user) => {
        this._user.next(user);
      }),
    );
  }

  // ******************* Users info **************************** //
  addUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.endpointAuth}`, {
      user,
    });
  }
  getUsers(
    limit: string,
    page: string,
    search: string,
  ): Observable<Pagination<User>> {
    let searchParams = new HttpParams();
    searchParams = searchParams.append('limit', limit);

    searchParams = searchParams.append('page', page);
    if (search) {
      searchParams = searchParams.append('search', search);
    }
    return this.http.get<Pagination<User>>(`${this.endpointAuth}`, {
      params: searchParams,
    });
  }
  getOne(id: string): Observable<User> {
    return this.http.get<User>(`${this.endpointAuth}/${id}`);
  }
  updateOne(user: User): Observable<User> {
    return this.http.patch<User>(`${this.endpointAuth}/${user._id}`, { user });
  }
  enableAccount(id: string): Observable<User> {
    return this.http.get<User>(`${this.endpointAuth}/${id}/enable-disable`);
  }
   deleteOne(id: string): Observable<null> {
    return this.http.delete<null>(`${this.endpointAuth}/${id}`);
  }
  updateAvatar(data: FormData, id: string): Observable<User> {
    return this.http.post<User>(`${this.endpointAuth}/${id}/avatar`, data).pipe(
      tap((user) => {
        this._user.next(user);
      }),
    );
  }
  updateState(user: User): Observable<any> {
    return this.http.patch<User>(`${this.endpointAuth}/state`, { user }).pipe(
      map((response) => {
        this._user.next(response);
      }),
    );
  }

  // *********************** TOKEN ******************************//
  decodeToken(token: string): JwtPayload | null {
    try {
      return jwtDecode(token);
    } catch (e) {
      console.error(e);
      this.doLogout();
      return null;
    }
  }
  getToken(): string | null {
    return localStorage.getItem(this.keyAccessToken);
  }
  deleteToken(): void {
    localStorage.removeItem(this.keyAccessToken);
  }
  doLogout(): Observable<boolean> {
    // Remove the access token from the local storage
    localStorage.removeItem('accessToken');

    // Return the observable
    return of(true);
  }
  isTokenExpired(expiryTime: number): boolean {
    if (expiryTime) {
      return expiryTime - new Date().getTime() / 1000 <= 5;
    }
    return false;
  }
}
