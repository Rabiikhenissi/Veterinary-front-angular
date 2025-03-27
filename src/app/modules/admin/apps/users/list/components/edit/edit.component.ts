import {Component, inject, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseConfirmationService } from '../../../../../../../../@fuse/services/confirmation';
import { User } from '../../../../../../../shared/models/user';
import { UserService } from '../../../../../../../shared/services/user.service';
import { NgForm, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatButton } from '@angular/material/button';
import {TranslocoModule} from "@ngneat/transloco";
import {forkJoin} from "rxjs";
import {LoadingService} from "../../../../../../../shared/services/loading.service";
import {GroupService} from "../../../../../../../shared/services/group.service";
import {Group} from "../../../../../../../shared/models/group";
import {MatOption} from "@angular/material/autocomplete";
import {MatSelect} from "@angular/material/select";
@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
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
    ],
})
export class EditComponent implements OnInit {
    //********* INJECT SERVICES ***********//
    _userService= inject(UserService);
    _groupService= inject(GroupService);
    _router= inject(Router);
    _route= inject(ActivatedRoute);
    _fuseConfirmationService= inject(FuseConfirmationService);
    _loadingService= inject(LoadingService);
    //********* DECLARE CLASSES/ENUMS ***********//
    id = this._route.snapshot.paramMap.get('id') || undefined;
    user: User;
    listGroups: Group[];
    ngOnInit(): void {
        if (this.id) {
            this._loadingService.show()
            forkJoin([
                this._userService.getOne(this.id),
                this._groupService.getAll(),
            ]).subscribe({
                next: (result:[User, Group[]]) => {
                    this.user = result[0];
                    this.listGroups = result[1];
                    this.user.groupsId = this.listGroups.filter((el)=>el._id === this.user.groupsId._id)[0];
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
               this._router.navigate(['../'], { relativeTo: this._route }).then();
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
              this._router.navigate([`../`], { relativeTo: this._route }).then();
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
                this._router.navigate([`../`], { relativeTo: this._route }).then();
            });
          }
        });
      }
}
