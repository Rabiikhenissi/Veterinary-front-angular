import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Router, ActivatedRoute } from '@angular/router';
import { Pet } from 'app/shared/models/pet';
import { AuthService } from 'app/shared/services/auth.service';
import { PetService } from 'app/shared/services/pet.service';
import { UserService } from 'app/shared/services/user.service';
import { FeatureCodes } from 'app/shared/enums/feature-codes';
import { FeatureActions } from 'app/shared/enums/feature-actions';
import { FeaturesDirective } from 'app/shared/directives/features.directive';
import { NotificationService } from 'app/shared/services/notification.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { User } from 'app/shared/models/user';
import { MatFormField } from '@angular/material/form-field';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { PetSpeciesService } from 'app/shared/services/petSpecies.service';
import { PetSpecies } from 'app/shared/models/petSpecies';
import { LoadingService } from 'app/shared/services/loading.service';
import { forkJoin, switchMap } from 'rxjs';
@Component({
  selector: 'app-details',
  imports: [CommonModule,
    DatePipe,
    MatPaginator,
    MatButtonModule,
    MatIconModule,
    FeaturesDirective,
  MatFormField,
MatOption,
MatSelect,
FormsModule],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss'
})
export class DetailsComponent {

  user :User= {} as User;
  userPets: Pet[] = [];
  featureCodes = FeatureCodes;
  featureActions = FeatureActions;
  selectedAvatar = '';
  avatars = [
    'assets/images/avatars/male.png',
    'assets/images/avatars/female.png',
  ];
  _authService= inject(AuthService);
    _userService= inject(UserService);
    _notificationService= inject(NotificationService);
    router= inject(Router);
    route= inject(ActivatedRoute);
    _petspeciesService=inject(PetSpeciesService)
    _loadingService=inject(LoadingService)
    _petService= inject(PetService);
    currentSize = 10;
    currentPage = 1;
    openFilter = false;
    filterType: string[] = [];
    filterStatus: string[] = [];
    filterSearch: string;
    filterSpecies: PetSpecies[] = [];
filterArchived:  boolean =false;
availableSpecies: PetSpecies[] = [];
isFiltering: boolean = false;
companyId:string=''

    total = 0;
    connectedUser: any;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  ngOnInit(): void {
  this.user._id = this.route.snapshot.paramMap.get('id');
  this.companyId = localStorage.getItem("connectedUserCompany");

  this._loadingService.show();

  forkJoin({
    user: this._userService.getOne(this.user._id),
    species: this._petspeciesService.getList(this.companyId),
  })
  .pipe(
    switchMap(({ user, species }) => {
      this.user.name = user.name;
      this.user.email = user.email;
      this.user.phone = user.phone;
      this.selectedAvatar = user.avatar || this.avatars[0];
      this.availableSpecies = species.data;

      // ⬇️ Return getList() Observable
      return this._petService.getList(
        this.currentSize.toString(),
        this.currentPage.toString(),
        this.filterSearch || '',
        this.user._id,
        this.filterSpecies.map(s => typeof s === 'string' ? s : s.name),
        this.filterArchived
      );
    })
  )
  .subscribe({
    next: results => {
      this.userPets = results.data;
      this.total = results.total;
      this._loadingService.hide(); // ✅ Only hide after pets load
    },
    error: err => {
      console.error(err);
      this._loadingService.hide();
    }
  });
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


  logout(): void {
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

  getList(): void {
    const speciesNames = this.filterSpecies.map(s =>
    typeof s === 'string' ? s : s.name
  );
  this._loadingService.show
    this._petService.getList(
      this.currentSize.toString(),
      this.currentPage.toString(),
      this.filterSearch || '',
      this.user._id,
      speciesNames,
        this.filterArchived,
    ).subscribe({
      next: results => {
        this.userPets = results.data;
        this.total = results.total;
        this._loadingService.hide()
      },

      error: err => {
        this._loadingService.hide()
        console.error(err)
      }
    });
  }

  approveArchiveRequest(pet: any, isRequestApproval: boolean) {
  this._loadingService.show();

  this._petService.Archive(pet._id).subscribe({
    next: () => {
      this.getList();

      const now = new Date();
      const formattedDate = now.toLocaleDateString();
      const formattedTime = now.toLocaleTimeString();

      let title = '';
      let message = '';
      let subject = '';

      if (isRequestApproval) {
        title = 'Archive Request Approved';
        subject = 'Your Archive Request Was Approved';
        message = `Hello,\n\nYour archive request for your pet ${pet.name} (${pet.species}) was approved on ${formattedDate} at ${formattedTime}.\n\nRegards,\nThe Clinic Team`;
      } else {
        title = 'Pet Archived by Clinic';
        subject = 'Your Pet Has Been Archived';
        message = `Hello,\n\nYour pet ${pet.name} (${pet.species}) was archived directly by the clinic on ${formattedDate} at ${formattedTime}.\nIf you have any questions, please contact us.\n\nRegards,\nThe Clinic Team`;
      }

      const notification = {
        userId: pet.ownerId._id,
        title,
        message,
        type: 'Pet Archive'
      };

      this._notificationService.createNotification(notification).subscribe({
        next: () => {
          // Send Email
          this._notificationService.sendEmailNotification(
            pet.ownerId.email,
            subject,
            message
          ).subscribe({
            next: () => console.log('Email sent'),
            error: err => console.error('Email failed:', err)
          });

          // Send SMS
          /*this._notificationService.sendSMSNotification(
            pet.ownerId.phone,
            message
          ).subscribe({
            next: () => console.log('SMS sent'),
            error: err => console.error('SMS failed:', err)
          });*/
        },
        error: err => console.error('Notification failed:', err)
      });

      this._loadingService.hide();
    },
    error: err => {
      console.error('Archiving failed:', err);
      this._loadingService.hide();
    }
  });
}


cancelArchiveRequest(petId: string) {
  this._petService.cancelArchiveRequest(petId).subscribe({
    next: () => this.getList(),
    error: err => console.error(err),
  });
}
onFilterChange(): void {
    this.currentPage = 1;
    this.getList();
    this.openFilter = false;
}
resetFilters() {
  this.filterSpecies = [];
  this.filterArchived = false;
}


getAvailableSpecies(): void {

  this._petspeciesService.getList(this.companyId).subscribe({
    next: (result) => {
      this.availableSpecies = result.data;
    },
    error: err => console.error('Failed to load species', err)
  });
}

approveRestoreRequest(pet: Pet) {
  this._petService.restoreOne(pet._id).subscribe({
    next: () => this.getList(),
    error: err => console.error('Approve restore failed', err)
  });
}

cancelRestoreRequest(petId: string) {
  this._petService.cancelRestoreRequest(petId).subscribe({
    next: () => this.getList(),
    error: err => console.error('Cancel restore failed', err)
  });
}



deletePet(petId: string) {
  this._petService.deleteOne(petId).subscribe({
    next: () => this.getList(),
    error: err => console.error('Delete failed', err)
  });
}

}
