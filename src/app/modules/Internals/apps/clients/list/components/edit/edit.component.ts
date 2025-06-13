import { CommonModule, Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingService } from 'app/shared/services/loading.service';
import { UserService } from 'app/shared/services/user.service';

@Component({
  selector: 'app-edit',
  imports: [ReactiveFormsModule,CommonModule],
  templateUrl: './edit.component.html',
})
export class EditComponent {
   userId: string;
   profileForm: FormGroup;
   _userService = inject(UserService);
   router = inject(Router);
   _location= inject(Location);
   _loading=inject(LoadingService)
   route=inject(ActivatedRoute);
   avatars = [
   { avatar: 'assets/images/avatars/av1.png'  },
   { avatar: 'assets/images/avatars/av2.png' },
   { avatar: 'assets/images/avatars/av3.png'  },
   { avatar: 'assets/images/avatars/av4.png'  },
   { avatar: 'assets/images/avatars/av5.png'  },
   { avatar: 'assets/images/avatars/av6.png' },
   { avatar: 'assets/images/avatars/av7.png' },
   { avatar: 'assets/images/avatars/av8.png' },
   { avatar: 'assets/images/avatars/av9.png' },
   { avatar: 'assets/images/avatars/av10.png'  },
   { avatar: 'assets/images/avatars/av11.png' },
   { avatar: 'assets/images/avatars/av12.png'  },
 ];
  constructor(private fb: FormBuilder) {
    this.profileForm = this.fb.group({
  _id: [''],
  name: ['', [Validators.required, Validators.minLength(3)]],
  email: ['', [Validators.required, Validators.email]],
  phone: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
  avatar: [''],
});}
  ngOnInit() {
     this.userId=this.route.snapshot.paramMap.get('id') || '';
    console.log(this.userId)
    this._loading.show()
    this._userService.getOne(this.userId).subscribe({
      next: (results) => {
        this.profileForm.patchValue(results);
        this._loading.hide()
      },
      error: (err) => {
        console.error(err)
        this._loading.hide()
      }
    });
  }
  
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
          this.router.navigate(['..'], { relativeTo: this.route });
        }
        , error: (error) => {
          console.error('Error updating profile:', error);
        }
      });
    }
  }

  onCancel() {
    this._location.back();
  }
}
