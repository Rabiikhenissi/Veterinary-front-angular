import { CommonModule, Location } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, NgForm } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { Router, ActivatedRoute } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoModule } from '@ngneat/transloco';
import { Group } from 'app/shared/models/group';
import { Pagination } from 'app/shared/models/pagination';
import { User } from 'app/shared/models/user';
import { GroupService } from 'app/shared/services/group.service';
import { LoadingService } from 'app/shared/services/loading.service';
import { UserService } from 'app/shared/services/user.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-edit-details',
imports: [
        FormsModule,
        MatButton,
        MatFormField,
        MatLabel,
        MatInput,
        MatError,
        ReactiveFormsModule,
        TranslocoModule,
        MatOption,
        MatSelect,
        CommonModule
    ],  templateUrl: './edit-details.component.html',
  styleUrl: './edit-details.component.scss'
})
export class EditDetailsComponent implements OnInit {
    //********* INJECT SERVICES ***********//
    _userService= inject(UserService);
    _groupService= inject(GroupService);
    _router= inject(Router);
    _route= inject(ActivatedRoute);
    _fuseConfirmationService= inject(FuseConfirmationService);
    _loadingService= inject(LoadingService);
    _location=inject(Location)
    //********* DECLARE CLASSES/ENUMS ***********//
    id = this._route.snapshot.paramMap.get('id') || undefined;
    user: User;
    companyId:string;
    listGroups: Group[];
    ngOnInit(): void {
        if (this.id) {
            this._loadingService.show()
            this.companyId=localStorage.getItem("connectedUserCompany")
            forkJoin([
                this._userService.getOne(this.id),
                  this._groupService.getList({types:'external', archived:false, companies:this.companyId}),
            ]).subscribe({
                next: (result: [User, Pagination<Group>]) => {
                    this.user = result[0];
                    this.listGroups = result[1].data;
                    if (this.user.groupsId) {
                    this.user.groupsId = this.listGroups.filter((el)=>el._id === this.user.groupsId._id)[0];}
                    this._loadingService.hide()
                },
                error: () => {
                    this._loadingService.hide()
                }
            });
        }
      }
    updateOne(myForm: NgForm) {
        if (myForm.valid) {
            this._userService.updateOne(this.user).subscribe(() => {
               this._location.back()
            });
        }
      }
    cancelEdit(myForm: NgForm) {
        if (myForm.pristine) {
          this._router.navigate([`../`], { relativeTo: this._route }).then();
        } else {
          // Open the confirmation dialog
          const confirmation = this._fuseConfirmationService.open({
            title: 'Cancel',
            message: 'Would you like to cancel the modification ?',
            actions: {
              confirm: {
                label: 'yes',
              },
              cancel: {
                label: 'no',
              },
            },
          });
          // Subscribe to the confirmation dialog closed action
          confirmation.afterClosed().subscribe((result) => {
            // If the confirm button pressed...
            if (result === 'confirmed') {
              this._location.back()
            }
          });
        }
      }
    deleteOne(row: User) {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
          title: 'Delete',
          message: 'Would you like to confirm the deletion ?',
          actions: {
            confirm: {
              label: 'yes',
            },
            cancel: {
              label: 'no',
            },
          },
        });

        // Subscribe to the confirmation dialog closed action
        confirmation.afterClosed().subscribe((result) => {
          // If the confirm button pressed...
          if (result === 'confirmed') {
            this._userService.deleteOne(row._id).subscribe(() => {
                this._location.back()
            });
          }
        });
      }

      archiveOne(row:User){
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
          title: 'Delete',
          message: 'Would you like to confirm the archiving ?',
          actions: {
            confirm: {
              label: 'yes',
            },
            cancel: {
              label: 'no',
            },
          },
        });

        // Subscribe to the confirmation dialog closed action
        confirmation.afterClosed().subscribe((result) => {
          // If the confirm button pressed...
          if (result === 'confirmed') {
            this._userService.ArchiveOne(row._id).subscribe(() => {
                this._location.back()
            });
          }
        });
      }
}
