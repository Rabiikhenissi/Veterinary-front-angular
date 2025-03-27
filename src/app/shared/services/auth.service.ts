import {inject, Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { UserService } from './user.service';
import { environment } from '../../../environments/environment';
import {AuthUtils} from "../../core/auth/auth.utils";

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    endpointAuth = `${environment.api}/auth`;
    private _authenticated = false;
    _httpClient = inject(HttpClient)
    _userService= inject(UserService)

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string) {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string {
        return localStorage.getItem('accessToken') ?? '';
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(email: string): Observable<any> {
        return this._httpClient.post(`${this.endpointAuth}/forgot-password`, {
            email,
            resetUrl: `${environment.api}/confirmation-required?email=${encodeURIComponent(
                email.toLowerCase(),
            )}&type=forgot`,
        });
    }

    /**
     * Reset password
     *
     * @param password
     */
    resetPassword(password: string, token:string): Observable<any> {
        return this._httpClient.post(`${this.endpointAuth}/reset-password`, {password, token});
    }

    /**
     * Sign in
     *
     * @param credentials
     */
    signIn(credentials: { email: string; password: string }): Observable<any> {
        // Throw error, if the user is already logged in
        if (this._authenticated) {
            return throwError('User is already logged in.');
        }

        return this._httpClient
            .post(`${this.endpointAuth}/login`, { ...credentials,  })
            .pipe(
                switchMap((response: any) => {
                    // Store the access token in the local storage
                    this.accessToken = response;
                    const connectedUser = this._userService.decodeToken(response);
                    // @ts-ignore
                    this._userService._defaultLink.next(connectedUser?.defaultLink);
                    this._authenticated = true;
                    // Return a new observable with the response
                    return of(response);
                }),
            );
    }

    /**
     * Sign out
     */
    signOut(): Observable<any> {
        // Remove the access token from the local storage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('connectedSite');

        // Set the authenticated flag to false
        this._authenticated = false;
        // Return the observable
        return of(true);
    }


    /**
     * Check the authentication status
     */
    check(): Observable<boolean> {
        // Check if the user is logged in
        if (this._authenticated) {
            return of(true);
        }

        // Check the access token availability
        if (!this.accessToken || this.accessToken === 'undefined') {
            localStorage.removeItem('accessToken');
            return of(false);
        }

        // Check the access token expire date
        if (AuthUtils.isTokenExpired(this.accessToken)) {
            return of(false);
        }
        return of(true);
    }
}
