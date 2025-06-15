import { Component, inject, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Pet } from 'app/shared/models/pet';
import {CommonModule, DatePipe } from '@angular/common';
import { AuthService } from 'app/shared/services/auth.service';
import { UserService } from 'app/shared/services/user.service';
import { PetService } from 'app/shared/services/pet.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatFormField, MatLabel, MatOption, MatSelect } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { PetSpecies } from 'app/shared/models/petSpecies';
import { PetSpeciesService } from 'app/shared/services/petSpecies.service';
import { forkJoin, of } from 'rxjs';
import { LoadingService } from 'app/shared/services/loading.service';
import { FeatureCodes } from 'app/shared/enums/feature-codes';
import { FeatureActions } from 'app/shared/enums/feature-actions';
import { FeaturesDirective } from 'app/shared/directives/features.directive';
import { getImageUrl } from 'app/shared/utils/image-utils';

@Component({
  selector: 'app-profile',
  imports: [MatSelect,MatOption,MatIconButton,MatIcon,FormsModule,DatePipe,MatFormField,MatPaginator,CommonModule,MatButtonModule,FeaturesDirective],
  templateUrl: './profile.component.html',
})
export class ProfileComponent {
  user = { id:"string",name: '', email: '',avatar:"" , phone:"" ,type:"" };
  userPets: Pet[] = [];
  selectedAvatar = '';
  connectedUser: any;
  connectedUserType:string;
featureCodes=FeatureCodes;
featureActions=FeatureActions;
  _authService= inject(AuthService);
  _userService= inject(UserService);
  _petSpecies=inject(PetSpeciesService)
  router= inject(Router);
  _loadingService=inject(LoadingService)
  route= inject(ActivatedRoute);
  _petService= inject(PetService);
  currentSize = 10;
  currentPage = 1;
  openFilter = false;
  filterType: string[] = [];
  filterStatus: string[] = [];
  filterSearch: string;
  filterSpecies: PetSpecies[] = [];
filterArchived:  boolean=false ;
availableSpecies: PetSpecies[] = [];
companyId:string
  total = 0;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  ngOnInit(): void {
  this.connectedUser = localStorage.getItem("connectedUserId");
  this.companyId = localStorage.getItem("connectedUserCompany");
  console.log(this.companyId);

  this._loadingService.show();

  this._userService.getOne(this.connectedUser).subscribe({
    next: (user) => {
      this.user.name = user.name;
      this.user.email = user.email;
      this.user.phone = user.phone;
      this.user.id = user._id;
      this.user.type = user.type;
      this.selectedAvatar = user.avatar;

      if (this.companyId) {
        // Only fetch species and call getList if companyId exists
        this._petSpecies.getList(this.companyId).subscribe({
          next: (speciesResponse) => {
            this.availableSpecies = speciesResponse.data;
            this.getList(); // call only after species loaded
            this._loadingService.hide();
          },
          error: (err) => {
            console.error('Error loading species:', err);
            this._loadingService.hide();
          }
        });
      } else {
        this.availableSpecies = [];
        this._loadingService.hide();
      }
    },
    error: (err) => {
      console.error('Error loading user:', err);
      this._loadingService.hide();
    }
  });
}

getProductImageUrl(imagePath: string): string {
        const url = getImageUrl(imagePath);
        return url;
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
      const speciesNames = this.filterSpecies.map(s =>
    typeof s === 'string' ? s : s.name
  );
      this._petService.getList(
        this.currentSize.toString(),
        this.currentPage.toString(),
        this.filterSearch || '',
        this.user.id,
        speciesNames,
        this.filterArchived,
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
    
onFilterChange(): void {
    this.currentPage = 1;
    this.getList();
}
resetFilters() {
  this.filterSpecies = [];
  this.filterArchived = false;
}
getAvailableSpecies(): void {

  this._petSpecies.getList(this.companyId).subscribe({
    next: (result) => {
      this.availableSpecies = result.data;
      console.log(result)
    },
    error: err => console.error('Failed to load species', err)
  });
}
requestRestore(petId: string): void {
  this._petService.requestRestore(petId).subscribe({
    next: () => {
      this.userPets = this.userPets.map(p =>
        p._id === petId ? { ...p, isRestoreRequested: true } : p
      );
    },
    error: err => console.error('Request restore failed', err)
  });
}

cancelRestoreRequest(petId: string): void {
  this._petService.cancelRestoreRequest(petId).subscribe({
    next: () => {
      this.userPets = this.userPets.map(p =>
        p._id === petId ? { ...p, isRestoreRequested: false } : p
      );
    },
    error: err => console.error('Cancel restore request failed', err)
  });
}
get isFiltering(): boolean {
  return (this.filterSpecies && this.filterSpecies.length > 0) || this.filterArchived !=false;
}
getUser(){
  this._userService.getOne(this.connectedUser).subscribe({
    next: (user) => {
      this.user.name = user.name;
      this.user.email = user.email;
      this.user.phone = user.phone;
      this.user.id = user._id;
      this.user.type = user.type;
      this.selectedAvatar = user.avatar;
    },
    error: (err) => {
      console.error('Error fetching user:', err);
    }
  });
}

}