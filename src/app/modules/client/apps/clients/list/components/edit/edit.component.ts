import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from 'app/shared/services/user.service';

@Component({
  selector: 'app-edit',
  imports: [ReactiveFormsModule],
  templateUrl: './edit.component.html',
})
export class EditComponent {
   userId: string;
  profileForm: FormGroup;
  _userService = inject(UserService);
  router = inject(Router);
  route=inject(ActivatedRoute);
  constructor(private fb: FormBuilder) {
    this.profileForm = this.fb.group({
      _id: [''],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      avatar: [''],
    });
  }
  ngOnInit() {
     this.userId=this.route.snapshot.paramMap.get('id') || '';
    console.log(this.userId)
    this._userService.getOne(this.userId).subscribe({
      next: (results) => {
        this.profileForm.patchValue(results);
      },
      error: (err) => console.error(err),
    });
  }
  avatars = [
    { avatar: 'assets/images/avatars/male.png', label: 'male' },
    { avatar: 'assets/images/avatars/female.png', label: 'female' }
  ];
  
  selectAvatar(avatarData: { avatar: string; label: string }) {
    this.profileForm.patchValue({
      avatar: avatarData.avatar,
    });
  }
  onSubmit() {
    if (this.profileForm.valid) {
      const payload = { ...this.profileForm.value, _id: this.userId };
    console.log('Submitting:', payload);
      this._userService.updateOne(payload).subscribe({
        next: (response) => {
          console.log('Profile updated successfully:', response);
          this.router.navigate(['..','..'], { relativeTo: this.route });
        }
        , error: (error) => {
          console.error('Error updating profile:', error);
        }
      });
    }
  }
}
