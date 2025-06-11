    import {inject, Injectable} from '@angular/core';
    import { HttpClient } from '@angular/common/http';
    import { Observable, of, throwError } from 'rxjs';
    import { catchError, map, switchMap, tap } from 'rxjs/operators';
    import { UserService } from './user.service';
    import { environment } from '../../../environments/environment';
    import {AuthUtils} from "../../core/auth/auth.utils";
    import { initializeApp } from 'firebase/app';
    import { getAuth, GoogleAuthProvider, FacebookAuthProvider, GithubAuthProvider, signInWithPopup } from 'firebase/auth';
    import { NotificationService } from './notification.service';
    import { MenuService } from './menu.service'; 
    @Injectable({
        providedIn: 'root',
    })
    export class AuthService {
        endpointAuth = `${environment.api}/auth`;
        private _authenticated = false;
        _httpClient = inject(HttpClient)
        _userService= inject(UserService)
        _menuService = inject(MenuService);
        _notificationService = inject(NotificationService);
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
        signIn(credentials: { email: string; password: string ,rememberMe:boolean}): Observable<any> {
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
                    console.log('Connected User:', this.connectedUser)
                    localStorage.setItem('connectedUserId', this.connectedUser.id);
                    this._notificationService.init(this.connectedUser.id);
                    localStorage.setItem('connectedUserType', this.connectedUser.type);
                    localStorage.setItem('connectedUserCompany', this.connectedUser.companyId);
                
                    
                    // @ts-ignore
                        this._userService._defaultLink.next(connectedUser?.defaultLink);
                        this._authenticated = true;
                        // Return a new observable with the response
                        return this._menuService.getMenu().pipe(
          tap((menu) => console.log('📌 Menu:', menu)),
          map(() => response)
        );
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
            localStorage.clear();
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

                    this._httpClient
                        .post<{ token: string }>(`${this.endpointAuth}/loginFire`, { firebaseToken })
                        .subscribe({
                            next: (response) => {
                                if (!response.token) {
                                    observer.error(new Error('Invalid response from server.'));
                                    return;
                                }

                                this.accessToken = response.token;

                                // Cast decoded token to any to avoid TS errors
                                const connectedUser = this._userService.decodeToken(response.token) as any;
                                this.connectedUser = connectedUser;

                                localStorage.setItem('connectedUserId', connectedUser.id);
                                this._notificationService.init(connectedUser.id);
                                localStorage.setItem('connectedUserType', connectedUser.type);
                                localStorage.setItem('connectedUserCompany', connectedUser.companyId);
                                console.log('Connected User:', this.connectedUser);
                                console.log('connectedUserId:', this.connectedUserId);
                                console.log('connectedUserId:', this.connectedUser.id);

                                console.log('Decoded Token:', connectedUser);
                                
                                
                                // @ts-ignore
                                this._userService._defaultLink.next(connectedUser?.defaultLink);
                                this._authenticated = true;

                                observer.next(user);
                            },
                            error: (error) => observer.error(error),
                        });
                })
                .catch(error => observer.error(error));
        });
    }
    
    }
