import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of, Subscriber } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { UserService } from '../../../shared/services/user.service';
import { MenuService } from '../../../shared/services/menu.service';
import { FeatureAuth } from '../../../shared/models/feature-auth';
import {AuthService} from "../../../shared/services/auth.service";
import {FeatureService} from "../../../shared/services/feature.service";

@Injectable({
  providedIn: 'root',
})
export class IsAuthorizedGuard {
  features: FeatureAuth[];
  /**
   * Constructor
   */
  constructor(
    private _authService: AuthService,
    private _router: Router,
    private userService: UserService,
    private menuService: MenuService,
    private featureService: FeatureService,
  ) {}

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
    const routeFeature = route.data['feature'];
    return this._check(redirectUrl, routeFeature);
  }
  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const redirectUrl = state.url === '/sign-out' ? '/' : state.url;
    const routeFeature = childRoute.data['feature'];
    return this._check(redirectUrl, routeFeature);
  }
  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Check the authenticated status
   *
   * @param redirectURL
   * @param routeFeature
   * @private
   */
  private _check(redirectURL: string, routeFeature): Observable<boolean> {
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
        let defaultLink = this.userService.defaultLink$.getValue();
        if (!defaultLink) {
          const connectedUser = this.userService.decodeToken(localStorage.getItem('accessToken'));
          // @ts-ignore
          this.userService._defaultLink.next(connectedUser?.defaultLink);
          defaultLink = this.userService.defaultLink$.getValue();
        }
        if (!this.features || !this.features.length) {
          return new Observable<boolean>((observer: Subscriber<boolean>) => {
            this.menuService.getMenu().subscribe(
              (data) => {
                this.features = data.features;
                this.userService.features$.next(this.features);
                const returnBoolean = data.features.map((val) => val.code).includes(routeFeature);
                if (!returnBoolean) {
                  // check status of default feature
                  this.featureService.getFeatureByCode(defaultLink).subscribe(
                    (feature) => {
                      return this._router.navigateByUrl(feature.link || '/signed-in-redirect');
                    },
                    () => {
                      return this._router.navigateByUrl('/signed-in-redirect');
                    },
                  );
                }
                observer.next(returnBoolean);
                observer.complete();
              },
              () => {
                observer.next(false);
                observer.complete();
              },
            );
          });
        } else {
          const returnBoolean = this.userService.features$
            .getValue()
            .map((val) => val.code)
            .includes(routeFeature);
          if (!returnBoolean) {
            // check status of default feature
            this.featureService.getFeatureByCode(defaultLink).subscribe(
              (feature) => {
                return this._router.navigateByUrl(feature.link || '/signed-in-redirect');
              },
              () => {
                return this._router.navigateByUrl('/signed-in-redirect');
              },
            );
          }
          return of(returnBoolean);
        }
      }),
    );
  }
}
