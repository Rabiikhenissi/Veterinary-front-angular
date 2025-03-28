import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Route,
  Router,
  RouterStateSnapshot,
  UrlSegment,
  UrlTree,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import {AuthService} from "../../../shared/services/auth.service";

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  /**
   * Constructor
   */
  constructor(private _authService: AuthService, private _router: Router) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Can activate
   *
   * @param route
   * @param state
   */
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean> | Promise<boolean> | boolean {
    const redirectUrl = state.url === '/sign-out' ? '/' : state.url;
    return this._check(redirectUrl);
  }

  /**
   * Can activate child
   *
   * @param childRoute
   * @param state
   */
  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const redirectUrl = state.url === '/sign-out' ? '/' : state.url;
    return this._check(redirectUrl);
  }

  /**
   * Can load
   *
   * @param route
   * @param segments
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canLoad(route: Route, segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean {
    return this._check('/');
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Check the authenticated status
   *
   * @param redirectURL
   * @private
   */
  private _check(redirectURL: string): Observable<boolean> {
    // Check the authentication status
    return this._authService.check().pipe(
      switchMap((authenticated) => {
        // If the user is not authenticated...
        if (!authenticated) {
          // Redirect to the sign-in page
          this._router.navigate(['sign-in'], { queryParams: { redirectURL } });

          // Prevent the access
          return of(false);
        }

        // Allow the access
        return of(true);
      }),
    );
  }
}
