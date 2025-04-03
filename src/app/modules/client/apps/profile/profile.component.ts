import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/shared/services/auth.service';
import { UserService } from 'app/shared/services/user.service';

@Component({
  selector: 'app-profile',
  imports: [],
  templateUrl: './profile.component.html',
})
export class ProfileComponent {
  user = { id:"string",name: '', email: '',icon:""};
  selectedIcon = '';
  icons = [
    'assets/images/avatars/male.png',
    'assets/images/avatars/female.png',
  ];
  constructor(private authService: AuthService,private userService:UserService, private router: Router) {}

  ngOnInit(): void {
    
    this.userService.getUserProfile().subscribe({
      next:results => {
        
        this.user.name = results.name;
        this.user.email = results.email;
        this.selectedIcon = this.user.icon || this.icons[0];
        this.user.id=results._id;
        ;
      },
      error: err => {
        console.error(err);
      },
    });
  }

  saveProfile(): void {
    
    this.userService.updateProfileIcon( this.user.id,this.user.icon ).subscribe({
      next: (updatedUser) => {
        console.log('Profile icon updated:', updatedUser);
      },
      error: (err) => {
        console.error('Error updating icon:', err);
      },
    });
  }

  logout(): void {
    this.authService.signOut();
    this.router.navigate(['/sign-out']);
  }
  selectIcon(icon: string): void {
    this.selectedIcon = icon;
  }
}
