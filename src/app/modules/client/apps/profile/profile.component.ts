import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Pet } from 'app/shared/models/pet';
import {DatePipe } from '@angular/common';
import { AuthService } from 'app/shared/services/auth.service';
import { UserService } from 'app/shared/services/user.service';

@Component({
  selector: 'app-profile',
  imports: [DatePipe],
  templateUrl: './profile.component.html',
})
export class ProfileComponent {
  user = { id:"string",name: '', email: '',avatar:"" , phone:"", pets: [] };
  selectedAvatar = '';
  connectedUser: any;
  avatars = [
    'assets/images/avatars/male.png',
    'assets/images/avatars/female.png',
  ];
  constructor(private authService: AuthService,private userService:UserService, private router: Router,private route: ActivatedRoute) {}
  

  ngOnInit(): void {
    this.connectedUser= this.authService._userService.decodeToken(this.authService.accessToken);
    this.userService.getOne(this.connectedUser.id).subscribe({
      next: (results) => {
        this.user.name = results.name;
        this.user.email = results.email;
        this.user.phone = results.phone;
        this.user.id = results._id;
        this.selectedAvatar = results.avatar || this.avatars[0];
        this.user.pets = results.petId 
        console.log(results);
      },
      error: (err) => console.error(err),
    });
    
  }

  // saveProfile(): void {
    
  //   this.userService.updateMyAvatar( this.user.id,this.user.avatar ).subscribe({
  //     next: (updatedUser) => {
  //       console.log('Profile avatar updated:', updatedUser);
  //     },
  //     error: (err) => {
  //       console.error('Error updating avatar:', err);
  //     },
  //   });
  // }

  logout(): void {
    this.authService.signOut();
    this.router.navigate(['/sign-out']);
  }
  selectAvatar(avatar: string): void {
    this.selectedAvatar = avatar;
  }

  editProfile() {
    this.router.navigate([`edit`], { relativeTo: this.route });
  }
  
  addNewPet() {
    this.router.navigate(['pet', 'add'], { relativeTo: this.route });
  }
  
  viewPetDetails(petId: string) {
    this.router.navigate([`pet`,petId], { relativeTo: this.route });
  }
  
  editPet(petId: string) {
    this.router.navigate([`pet`,petId,`edit`], { relativeTo: this.route });
  }
}
