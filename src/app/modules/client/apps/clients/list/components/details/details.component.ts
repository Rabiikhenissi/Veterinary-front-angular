import { DatePipe } from '@angular/common';
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
@Component({
  selector: 'app-details',
  imports: [DatePipe,MatPaginator,FeaturesDirective],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss'
})
export class DetailsComponent {

  user = { id:"string",name: '', email: '',avatar:"" , phone:""};
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
    _petService= inject(PetService);
    currentSize = 10;
    currentPage = 1;
    openFilter = false;
    filterType: string[] = [];
    filterStatus: string[] = [];
    filterSearch: string;
    total = 0;
    connectedUser: any;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  ngOnInit(): void {
    this.user.id= this.route.snapshot.paramMap.get('id');
    this._userService.getOne(this.user.id).subscribe({
      next: (results) => {
        this.user.name = results.name;
        this.user.email = results.email;
        this.user.phone = results.phone;
        this.selectedAvatar = results.avatar || this.avatars[0];
        this.getList()
      },
      error: (err) => console.error(err),
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

  approveArchiveRequest(pet: any, isRequestApproval: boolean) {
    console.log('Pet to archive:', pet);
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
          console.log('Notification created');
          
          // Then send email
          this._notificationService.sendEmailNotification(
            pet.ownerId.email,  // Make sure you have this info
            subject,
            message
          ).subscribe({
            next: () => console.log('Email sent'),
            error: err => console.error('Email failed:', err)
          });

        },
        error: err => console.error('Notification failed:', err)
      });
    },
    error: err => console.error('Archiving failed:', err),
  });
}


cancelArchiveRequest(petId: string) {
  this._petService.cancelArchiveRequest(petId).subscribe({
    next: () => this.getList(),
    error: err => console.error(err),
  });
}

}
