import {Component, inject, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseConfirmationService } from '../../../../../../../../@fuse/services/confirmation';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatError, MatOption, MatSelect} from '@angular/material/select';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatButton } from '@angular/material/button';
import {TranslocoPipe} from "@ngneat/transloco";
import {LoadingService} from "../../../../../../../shared/services/loading.service";
import {forkJoin} from "rxjs";
import {UserService} from "../../../../../../../shared/services/user.service";
import {GroupService} from "../../../../../../../shared/services/group.service";
import {User} from "../../../../../../../shared/models/user";
import {Group} from "../../../../../../../shared/models/group";
 @Component({
    selector: 'app-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss'],
    standalone: true,
     imports: [
         FormsModule,
         MatButton,
         MatFormField,
         MatLabel,
         MatInput,
         ReactiveFormsModule,
         MatError,
         TranslocoPipe,
         MatOption,
         MatSelect,
     ],
})
export class DetailsComponent implements OnInit {
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
    updateOne() {
        this._router.navigate([`/home/users/${this.user._id}/edit`]).then();
    }
    deleteOne() {
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
                this._userService.deleteOne(this.user._id).subscribe(() => {});
                this._router.navigate(['/home/users']).then();
            }
        });
    }
}
