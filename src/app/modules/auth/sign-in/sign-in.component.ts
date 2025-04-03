import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import {
    FormsModule,
    NgForm,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { AuthService } from '../../../shared/services/auth.service';
import { UserService } from '../../../shared/services/user.service';
import { User } from '../../../shared/models/user';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'auth-sign-in',
    templateUrl: './sign-in.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        RouterLink,
        FuseAlertComponent,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatCheckboxModule,
        MatProgressSpinnerModule,
    ],
})
export class AuthSignInComponent implements OnInit {
    @ViewChild('signInNgForm') signInNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };
    signInForm: UntypedFormGroup;
    showAlert: boolean = false;
    user: User | undefined;

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _authService: AuthService,
        private _userService: UserService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Create the form
        this.signInForm = this._formBuilder.group({
            email     : ['soudanioussama7@gmail.com', [Validators.required, Validators.email]],
            password  : ['Test123', Validators.required],
            rememberMe: [''],
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign in
     */
    signIn(): void {
        // Return if the form is invalid
        if (this.signInForm.invalid) {
            return;
        }

        // Disable the form
        this.signInForm.disable();

        // Hide the alert
        this.showAlert = false;

        // Sign in
        this._authService.signIn(this.signInForm?.value).subscribe(
            () => {
                // Set the redirect url.
                // The '/signed-in-redirect' is a dummy url to catch the internationalization and redirect the user
                // to the correct page after a successful sign in. This way, that url can be set via
                // routing file and we don't have to touch here.
                this._userService.get().subscribe((user: User) => {
                    this.user = user;
                });
                const redirectURL =
                    this._activatedRoute.snapshot.queryParamMap.get(
                        'redirectURL'
                    ) ||
                    this._userService._defaultLink.getValue() ||
                    '/signed-in-redirect';
                localStorage.setItem(
                    'email',
                    this.signInForm?.get('email')?.value
                );
                // Navigate to the redirect url
                this._router.navigateByUrl(redirectURL);
            },
            (error: HttpErrorResponse) => {
                // Re-enable the form
                this.signInForm?.enable();

                // Handle account lock due to failed attempts
                if (error.status === 403 ){

                  if(error.error.msg ==='Your account is pending approval . We thank you for your patience.') {
                  this.showAlert = true;
                  this.alert = {
                      type: 'info',
                      message:
                          'Your account is pending approval . We thank you for your patience.',
                  };
              } 
                // Handle account pending approval
                else if (
                  error.error.msg ===
                      'Your account is locked due to multiple failed login attempts. Please contact an Administrator.'
              ) {
                  this.showAlert = true;
                  this.alert = {
                      type: 'error',
                      message:
                          'Your account is locked due to multiple failed login attempts. Please contact an Administrator.',
                  };
              }}
                // Handle other authentication errors
                else if (error.status === 400) {
                    this.showAlert = true;
                    this.alert = {
                        type: 'error',
                        message: 'Invalid email or password.',
                    };
                }
            }
        );
    }
    signInWithGoogle(): void {
        this._authService.signInWithGoogle().subscribe(
            (user) => {
                console.log('Google user:', user);
                const redirectURL =
                    this._userService._defaultLink.getValue() ||
                    '/signed-in-redirect';
                this._router.navigateByUrl(redirectURL);
            },
            (error) => {
                console.error('Error during Google login:', error);
            }
        );
    }

    signInWithFacebook(): void {
        this._authService.signInWithFacebook().subscribe(
            (user) => {
                console.log('Facebook user:', user);
                const redirectURL =
                    this._userService._defaultLink.getValue() ||
                    '/signed-in-redirect';
                this._router.navigateByUrl(redirectURL);
            },
            (error) => {
                console.error('Error during Facebook login:', error);
            }
        );
    }

    signInWithGithub(): void {
        this._authService.signInWithGithub().subscribe(
            (user) => {
                console.log('Github user:', user);
                const redirectURL =
                    this._userService._defaultLink.getValue() ||
                    '/signed-in-redirect';
                this._router.navigateByUrl(redirectURL);
            },
            (error) => {
                console.error('Error during Github login:', error);
            }
        );
    }
}
