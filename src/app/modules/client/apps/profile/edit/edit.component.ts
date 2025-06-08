import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingService } from 'app/shared/services/loading.service';
import { UserService } from 'app/shared/services/user.service';
import { forkJoin } from 'rxjs';

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
  _loadingService=inject(LoadingService)
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
    this._loadingService.show(); // Start loading
    forkJoin({
      user: this._userService.getOne(this.userId),
    }).subscribe({
      next: ({ user }) => {
        this.profileForm.patchValue(user);
        this._loadingService.hide(); // Stop loading
      },
      error: (err) => {
        console.error('Error fetching user profile:', err);
        this._loadingService.hide(); // Stop loading even on error
      }
    });
  }
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
  
  
  selectAvatar(avatarData: { avatar: string; label: string }) {
    this.profileForm.patchValue({
      avatar: avatarData.avatar,
    });
  }
  onSubmit() {
    if (this.profileForm.valid) {
      const payload = { ...this.profileForm.value, _id: this.userId };
    this._loadingService.show(); // Start loading
      this._userService.updateOne(payload).subscribe({
        next: (response) => {
          this._loadingService.hide(); // Stop loading
          
          this.router.navigate(['/home/profile']);
        }
        , error: (error) => {
          console.error('Error updating profile:', error);
        }
      });
    }
  }
  onCancel() {
  this.router.navigate(['/home/profile']);
}
}
