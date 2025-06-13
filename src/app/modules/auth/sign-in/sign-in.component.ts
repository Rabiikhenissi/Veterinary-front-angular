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
import { MenuService } from 'app/shared/services/menu.service';

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
        private _menuService: MenuService,
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
            rememberMe: [false],
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign in
     */
     signIn(): void {
        if (this.signInForm.invalid) {
            return;
        }

        this.signInForm.disable();
        this.showAlert = false;

        this._authService.signIn(this.signInForm.value).subscribe({
            next: () => {
                const redirectURL =
                    this._activatedRoute.snapshot.queryParamMap.get('redirectURL') ||
                    this._userService._defaultLink.getValue() ||
                    '/signed-in-redirect';

                localStorage.setItem('email', this.signInForm.get('email')?.value);

                // Clear features before fetching new ones
                this._userService._features.next(null);

                // Fetch updated menu/features then navigate
                this._menuService.getMenu().subscribe({
                    next: (data) => {
                        this._userService._features.next(data.features);
                        this._router.navigateByUrl(redirectURL);
                    },
                    error: () => {
                        // Navigate even if fetching features fails
                        this._router.navigateByUrl(redirectURL);
                    }
                });
            },
            error: (error: HttpErrorResponse) => {
                this.signInForm.enable();

                if (error.status === 403) {
                    if (error.error.msg === 'Your account is pending approval . We thank you for your patience.') {
                        this.showAlert = true;
                        this.alert = {
                            type: 'info',
                            message: 'Your account is pending approval. We thank you for your patience.',
                        };
                    } else if (
                        error.error.msg ===
                        'Your account is locked due to multiple failed login attempts. Please contact an Administrator.'
                    ) {
                        this.showAlert = true;
                        this.alert = {
                            type: 'error',
                            message: 'Your account is locked due to multiple failed login attempts. Please contact an Administrator.',
                        };
                    } else if (
                        error.error.msg === 'Your account is locked.Please contact an Administrator.'
                    ) {
                        this.showAlert = true;
                        this.alert = {
                            type: 'error',
                            message: 'Your account is locked. Please contact an Administrator.',
                        };
                    }
                } else if (error.status === 400) {
                    this.showAlert = true;
                    this.alert = {
                        type: 'error',
                        message: 'Invalid email or password.',
                    };
                }
            }
        });
    }

    signInWithGoogle(): void {
        this._authService.signInWithGoogle().subscribe(
            (user) => {
                console.log('Google user:', user);
                const redirectURL =
                    this._userService._defaultLink.getValue() ||
                    '/signed-in-redirect';
 this._router.navigateByUrl(redirectURL).then(() => {
                window.location.reload();
            });            },
            (error) => {
                console.error('Error during Google login:', error);
            }
        );
    }

 
}
