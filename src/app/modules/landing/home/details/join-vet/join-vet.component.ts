import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl, ValidationErrors, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FuseAlertComponent } from '@fuse/components/alert';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { UserService } from 'app/shared/services/user.service';

@Component({
  selector: 'app-join-vet',
  imports: [
        RouterLink,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatCheckboxModule,
        MatProgressSpinnerModule,
        CommonModule
    ],  templateUrl: './join-vet.component.html',
  styleUrl: './join-vet.component.scss'
})
export class JoinVetComponent implements OnInit {
  _userService = inject(UserService);
  _router = inject(Router);
  _route = inject(ActivatedRoute);
  _fuseConfirmationService = inject(FuseConfirmationService);
  formBuilder = inject(FormBuilder);
  signUpForm: FormGroup;
   companyId= this._route.snapshot.paramMap.get('id') || undefined;

  showAlert: boolean = false;
  alert: { type: 'success' | 'error'; message: string } = { type: 'success', message: '' };


  ngOnInit(): void {
     
    this.signUpForm = this.formBuilder.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{8,15}$')]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  };

 signUp(): void {
    console.log('Sign-up form submitted');
    if (this.signUpForm.invalid) {
      console.log('Form invalid:', this.signUpForm.errors, this.signUpForm.controls);
      this.signUpForm.markAllAsTouched();
      return;
    }

    const formValue = this.signUpForm.value;
    const user = {
      name: formValue.fullName,
      email: formValue.email,
      phone: formValue.phone,
      password: formValue.password,
      companyId: { _id: this.companyId }
    };

    console.log('User object to be sent:', user);

    this._userService.signUp(user).subscribe({
      next: (res) => {
       this._fuseConfirmationService.open({
                            title: 'Welcome to Zoovana',
                            message: 'You have successfully created an account . You now have to wait for your account to be accepted.',
                            actions: {
                                confirm: {
                                    label: 'OK',
                                    color: 'primary',
                                }
                            }
                        }).afterClosed().subscribe(() => {
                            this._router.navigate(['/sign-in']);
                        });
      },
      error: (err) => {
        console.error('Signup error:', err);
        this.showAlert = true;
        this.alert = { type: 'error', message: err.error?.message || 'Signup failed' };
      }
    });
  }
}