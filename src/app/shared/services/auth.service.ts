import {inject, Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { UserService } from './user.service';
import { environment } from '../../../environments/environment';
import {AuthUtils} from "../../core/auth/auth.utils";
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, GithubAuthProvider, signInWithPopup } from 'firebase/auth';
@Injectable({
    providedIn: 'root',
})
export class AuthService {
    endpointAuth = `${environment.api}/auth`;
    private _authenticated = false;
    _httpClient = inject(HttpClient)
    _userService= inject(UserService)
    private app = initializeApp(environment.firebaseConfig); // Initialize Firebase app
    private auth = getAuth(this.app); // Get Firebase auth instance
    connectedUser: any; // Variable to store connected user
    connectedUserId: string; // Variable to store connected user ID
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
                 this.connectedUser = connectedUser;
                 console.log(this.connectedUser);
                 localStorage.setItem('connectedUserId', this.connectedUser.id);
                 localStorage.setItem('connectedUserType', this.connectedUser.type);
                 localStorage.setItem('connectedUserCompany', this.connectedUser.companyId);
            
                 
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

 /**
     * Sign in with google
     */
 signInWithGoogle(): Observable<any> {
    const provider = new GoogleAuthProvider();
    return new Observable(observer => {
        signInWithPopup(this.auth, provider)
            .then(async result => {
                const user = result.user;
                if (!user) return;

                const firebaseToken = await user.getIdToken();
                this._httpClient.post<{ token: string }>(`${this.endpointAuth}/loginFire`, { firebaseToken })
                    .subscribe({
                        next: (response) => {
                            if (!response.token) {
                                observer.error(new Error('Invalid response from server.'));
                                return;
                            }
                            this.accessToken = response.token;
                            this._authenticated = true;
                            observer.next(user);
                        },
                        error: error => observer.error(error),
                    });
            })
            .catch(error => observer.error(error));
    });
}
    
 /**
     * Sign in with facebook
     */      signInWithFacebook(): Observable<any> {
        const provider = new FacebookAuthProvider();
        return new Observable(observer => {
          signInWithPopup(this.auth, provider)
            .then(result => {
              const user = result.user;
              if (user) {
                user.getIdToken().then(token => {
                  this.accessToken = token;
                  this._authenticated = true;
                  observer.next(user);
                });
              }
            })
            .catch(error => observer.error(error));
        });
      }
    
 /**
     * Sign in with github
     */      signInWithGithub(): Observable<any> {
        const provider = new GithubAuthProvider();
        return new Observable(observer => {
          signInWithPopup(this.auth, provider)
            .then(result => {
              const user = result.user;
              if (user) {
                user.getIdToken().then(token => {
                  this.accessToken = token;
                  this._authenticated = true;
                  observer.next(user);
                });
              }
            })
            .catch(error => observer.error(error));
        });
      }
}
