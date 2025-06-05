import { Component, inject, OnInit } from '@angular/core';
import { NgForm, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../../shared/services/user.service';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatButton } from '@angular/material/button';
import { TranslocoPipe } from '@ngneat/transloco';
import { forkJoin } from 'rxjs';
import { MatOption } from '@angular/material/autocomplete';
import { MatSelect } from '@angular/material/select';
import { CompanyService } from 'app/shared/services/company.service';
import { Company } from 'app/shared/models/company';
import { FilterOptions } from 'app/shared/models/filter-options';
import { Pagination } from 'app/shared/models/pagination';
import { SnackBarService } from 'app/shared/services/snack-bar.service';
import { fuseAnimations } from '@fuse/animations';
import { GroupService } from 'app/shared/services/group.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { LoadingService } from 'app/shared/services/loading.service';
import { listFeatureType } from 'app/shared/enums/featureType';
import { Group } from 'app/shared/models/group';
import { User } from 'app/shared/models/user';
import { AuthService } from 'app/shared/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-details',
    templateUrl: './add.component.html',
    styleUrls: ['./add.component.scss'],
    animations: fuseAnimations,
    imports: [
          FormsModule,
        MatButton,
        MatFormField,
        MatLabel,
        MatInput,
        MatError,
        ReactiveFormsModule,
        TranslocoPipe,
        MatOption,
        MatSelect,
        CommonModule
        
    ],
})
export class AddComponent implements OnInit {
    //********* INJECT SERVICES ***********//
    _userService = inject(UserService);
    _groupService = inject(GroupService);
    _companyService = inject(CompanyService);
    _router = inject(Router);
    _fuseConfirmationService = inject(FuseConfirmationService);
    _route = inject(ActivatedRoute);
    _loadingService = inject(LoadingService);
    _snackBarService = inject(SnackBarService);
    //********* DECLARE CLASSES/ENUMS ***********//
    user = new User();
    listGroups: Group[] = [];
    listCompany: Group[] = [];
    filterOptions: FilterOptions = new FilterOptions();
    currentSize = 10;
    currentPage = 1;
    typingTimer;
    doneTypingInterval = 500;
    isScreenSmall: boolean;
    //************* FILTERS *****************//
    openFilter = false;
    filterType: string[] = [];
    filterStatus: string[] = [];
    filterSearch: string;
    _authService = inject(AuthService);
    ngOnInit(): void {
        this._loadingService.show();

        forkJoin([  this._groupService.getList({types:'external', archived:false}) ,]).subscribe({
            next: (result: [Pagination<Group>]) => {
                this.listGroups = result[0].data;
                console.log(this.listGroups);
                 this._loadingService.hide();
            },
            error: () => {
                this._loadingService.hide();
            },
        });
        this.getList();
    }
    getList(): void {
        this._loadingService.show();
        this._companyService
            .getList(
                this.currentSize.toString(),
                this.currentPage.toString(),
                this.filterSearch,
            )
            .subscribe({
                next: (results) => {
                    this.listCompany = results.data;
                    this.openFilter = false;
                    this._loadingService.hide();
                },
                error: () => {
                    this._loadingService.hide();
                    this.openFilter = false;
                },
            });
    }
   
    addOne(myForm: NgForm): void {
    if (myForm.valid) {
      console.log(this.user);
      this.user.type="external"
      this._loadingService.show();
        this._userService.addUser(this.user).subscribe({
          next: (result) => {
            this._loadingService.hide();
            this._router.navigate([`../`], { relativeTo: this._route }).then();
          },
          error: () => {
            this._snackBarService.openSnackBar(
              'Error creating user',
            );
            this._loadingService.hide();
          },
        })
    }
  }
    resetForm(myForm: NgForm, event) {
        event.stopPropagation();
        if (myForm.pristine) {
            myForm.resetForm();
        } else {
            // Open the confirmation dialog
            const confirmation = this._fuseConfirmationService.open({
                title: 'Clear',
                message: 'Would you like to clear the information ?',
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
                    myForm.resetForm();
                }
            });
        }
    }
    cancelForm(myForm: NgForm) {
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
                    this._router
                        .navigate([`../`], { relativeTo: this._route })
                        .then();
                }
            });
        }
    }

    protected readonly listFeatureType = listFeatureType;
}