import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of, Subscriber } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { UserService } from '../../../shared/services/user.service';
import { MenuService } from '../../../shared/services/menu.service';
import { FeatureAuth } from '../../../shared/models/feature-auth';
import {AuthService} from "../../../shared/services/auth.service";
import {FeatureService} from "../../../shared/services/feature.service";
import { FeatureActions } from 'app/shared/enums/feature-actions';

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
): Observable<boolean> {
  const redirectUrl = state.url === '/sign-out' ? '/' : state.url;
  const routeFeature = route.data['feature'];
  const routeAction = route.data['action']; // ✅ Extract here
  return this._check(redirectUrl, routeFeature, routeAction);
}
  canActivateChild(
  childRoute: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
): Observable<boolean> {
  const redirectUrl = state.url === '/sign-out' ? '/' : state.url;
  const routeFeature = childRoute.data['feature'];
  const routeAction = childRoute.data['action']; // ✅ Extract here
  return this._check(redirectUrl, routeFeature, routeAction);
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
  private _check(redirectURL: string, routeFeature,routeAction?: string): Observable<boolean> {
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
                const feature = data.features.find(f => f.code === routeFeature);
                this.userService.features$.next(this.features);
                const returnBoolean =feature &&(routeAction || data.features.map((val) => val.code).includes(routeFeature));
                if (!returnBoolean) {
  this.featureService.getFeatureByCode(defaultLink).subscribe(
    (feature) => {
      this._router.navigateByUrl(feature.link || '/signed-in-redirect');
    },
    () => {
      this._router.navigateByUrl('/signed-in-redirect');
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
          const feature = this.userService.features$.getValue().find(f => f.code === routeFeature);
const returnBoolean = feature && (!routeAction || feature.actions?.includes(routeAction as FeatureActions));
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
