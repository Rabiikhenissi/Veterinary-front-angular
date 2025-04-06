import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from 'app/shared/services/user.service';

@Component({
  selector: 'app-edit',
  imports: [ReactiveFormsModule],
  templateUrl: './edit.component.html',
})
export class EditComponent {
  profileForm: FormGroup;
  _userService = inject(UserService);
  router = inject(Router);

  constructor(private fb: FormBuilder) {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      avatar: [''],
    });
  }

  ngOnInit() {
    this._userService.getUserProfile().subscribe(user => {
      this.profileForm.patchValue(user);
    });
  }

  onSubmit() {
    if (this.profileForm.valid) {
      this._userService.updateOne(this.profileForm.value).subscribe(() => {
        this.router.navigate(['/home/profile']);
      });
    }
  }
}
