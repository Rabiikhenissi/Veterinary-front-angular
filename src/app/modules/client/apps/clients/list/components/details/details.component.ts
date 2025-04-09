import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'app/shared/services/auth.service';
import { UserService } from 'app/shared/services/user.service';

@Component({
  selector: 'app-details',
  imports: [DatePipe],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss'
})
export class DetailsComponent {

  user = { id:"string",name: '', email: '',avatar:"" , phone:"", pets: [] };
  selectedAvatar = '';
  avatars = [
    'assets/images/avatars/male.png',
    'assets/images/avatars/female.png',
  ];
  constructor(private _userService:UserService, private router: Router,private route: ActivatedRoute) {}
  

  ngOnInit(): void {
    this.user.id= this.route.snapshot.paramMap.get('id');
    this._userService.getOne(this.user.id).subscribe({
      next: (results) => {
        this.user.name = results.name;
        this.user.email = results.email;
        this.user.phone = results.phone;
        this.selectedAvatar = results.avatar || this.avatars[0];
        this.user.pets = results.petId 
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
    this.router.navigate(['/sign-out']);
  }
  selectAvatar(avatar: string): void {
    this.selectedAvatar = avatar;
  }

  editProfile() {
    this.router.navigate(["..",this.user.id,`edit`], { relativeTo: this.route });
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
