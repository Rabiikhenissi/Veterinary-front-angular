import { Component, inject, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Pet } from 'app/shared/models/pet';
import {DatePipe } from '@angular/common';
import { AuthService } from 'app/shared/services/auth.service';
import { UserService } from 'app/shared/services/user.service';
import { PetService } from 'app/shared/services/pet.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-profile',
  imports: [DatePipe,MatPaginator],
  templateUrl: './profile.component.html',
})
export class ProfileComponent {
  user = { id:"string",name: '', email: '',avatar:"" , phone:"" ,type:"" };
  userPets: Pet[] = [];
  selectedAvatar = '';
  connectedUser: any;

  _authService= inject(AuthService);
  _userService= inject(UserService);
  router= inject(Router);
  route= inject(ActivatedRoute);
  _petService= inject(PetService);
  currentSize = 10;
  currentPage = 1;
  openFilter = false;
  filterType: string[] = [];
  filterStatus: string[] = [];
  filterSearch: string;
  total = 0;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  ngOnInit(): void {
    this.connectedUser= this._authService._userService.decodeToken(this._authService.accessToken);
    this._userService.getOne(this.connectedUser.id).subscribe({
      next: (results) => {
        this.user.name = results.name;
        this.user.email = results.email;
        this.user.phone = results.phone;
        this.user.id = results._id;
        this.user.type = results.type;
        console.log('User:', this.user);
        this.selectedAvatar = results.avatar ;
        
    this.getList()
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
    this.router.navigate([this.user.id,`edit`], { relativeTo: this.route });
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

  pageChanged(event: PageEvent ): void {
      let { pageIndex } = event;
      const { pageSize } = event;
      pageIndex++;
      if (pageSize !== this.currentSize) {
        pageIndex = 1;
        this.paginator.firstPage();
      }
      this.currentSize = pageSize;
      this.currentPage = pageIndex;
      this.getList();
    }


    getList(): void {
      this._petService.getList(
        this.currentSize.toString(),
        this.currentPage.toString(),
        this.filterSearch || '',
        this.user.id
      ).subscribe({
        next: results => {
          this.userPets = results.data;
          this.total = results.total; // 👈 à afficher dans le paginator
          console.log('User pets:', this.userPets);
        },
        error: err => console.error(err)
      });
    }
    
    requestArchive(petId: string): void {
  this._petService.requestArchive(petId).subscribe({
    next: () => {
      // Refresh or optimistically update pet state
      this.userPets = this.userPets.map(p =>
        p._id === petId ? { ...p, isArchiveRequested: true } : p
      );
    },
    error: err => console.error('Request archive failed', err)
  });
}

cancelArchiveRequest(petId: string): void {
  this._petService.cancelArchiveRequest(petId).subscribe({
    next: () => {
      this.userPets = this.userPets.map(p =>
        p._id === petId ? { ...p, isArchiveRequested: false } : p
      );
    },
    error: err => console.error('Cancel request failed', err)
  });
}
    
}