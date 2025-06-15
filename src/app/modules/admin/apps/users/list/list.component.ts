import {Component, inject, OnInit, ViewChild} from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import { FilterOptions } from '../../../../../shared/models/filter-options';
import { Pagination } from '../../../../../shared/models/pagination';
import { FuseConfirmationService } from '../../../../../../@fuse/services/confirmation';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatButton, MatIconButton } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInput} from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel, MatPrefix } from '@angular/material/form-field';
import {TranslocoPipe} from "@ngneat/transloco";
import {LoadingService} from "../../../../../shared/services/loading.service";
import { UserService } from 'app/shared/services/user.service';
import {User} from "../../../../../shared/models/user";
import { CompanyService } from 'app/shared/services/company.service';
import { Company } from 'app/shared/models/company';
import { FeatureCodes } from 'app/shared/enums/feature-codes';
import { FeatureActions } from 'app/shared/enums/feature-actions';
import { FeaturesDirective } from 'app/shared/directives/features.directive';
import { CommonModule } from '@angular/common';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { GroupService } from 'app/shared/services/group.service';
import { MatOption, MatSelect } from '@angular/material/select';
import { forkJoin } from 'rxjs';
@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  imports: [
        MatFormField,
        MatIcon,
        MatPrefix,
        MatInput,
        FormsModule,
        MatButton,
        MatIconButton,
        MatMenuTrigger,
        MatMenu,
        MatMenuItem,
        MatPaginator,
        TranslocoPipe,
        FeaturesDirective,
        CommonModule,
        MatSelect,
        MatOption,
    ],
})
export class ListComponent implements OnInit {
  //********* INJECT SERVICES ***********//
  _userService= inject(UserService);
  _companyService= inject(CompanyService);
  _router= inject(Router);
  _fuseConfirmationService= inject(FuseConfirmationService);
  _route= inject(ActivatedRoute);
  _loadingService = inject(LoadingService)
  companyNames: Map<string, string> = new Map();
  @ViewChild(MatPaginator) paginator: MatPaginator;
groups: any[] = [];
filterOptions: FilterOptions = new FilterOptions();
currentSize = 10;
currentPage = 1;
displayedList: Pagination<User>;
typingTimer;
doneTypingInterval = 500;
isScreenSmall: boolean;
featureCodes = FeatureCodes;
featureActions = FeatureActions;
_groupService=inject(GroupService)
//************* FILTERS *****************//
openFilter = false;
filterarchived:boolean=false;
filtergroups: string[] = [];
filterstatus:string[]=[];
filterCompany:string[]=[];
filterSearch: string;

  ngOnInit(): void {
  this._loadingService.show();
  forkJoin([
    this._groupService.getAll(),
    this._companyService.getAll(), // Fetch all companies here
    this._userService.getUsers(
      this.currentSize.toString(),
      this.currentPage.toString(),
      this.filterSearch,
      this.filterarchived,
      this.filtergroups,
      this.filterstatus,
      this.filterCompany
    )
  ]).subscribe({
    next: ([groups, companies, users]) => {
      this.groups = groups;
      // Build the company name map
      (companies.data || []).forEach((company: Company) => {
        this.companyNames.set(company._id, company.name);
      });
      this.displayedList = users;
      this.openFilter = false;
      this._loadingService.hide();
    },
    error: () => {
      this._loadingService.hide();
      this.openFilter = false;
    }
  });
}
  loadGroups(): void {
  this._groupService.getAll().subscribe((groups) => {
    this.groups = groups;
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
  getCompany(companyId: string): string {
  if (!companyId) return '';
  return this.companyNames.get(companyId) || '';
}
  getList(): void {
    
  this._loadingService.show();
  this._userService
    .getUsers(
      this.currentSize.toString(),
      this.currentPage.toString(),
      this.filterSearch,
      this.filterarchived, 
      this.filtergroups,    
      this.filterstatus,
      this.filterCompany 
    )
    .subscribe({
      next: results => {
        
        this.displayedList = results;
        this.openFilter = false;
        this._loadingService.hide();
      },
      error: () => {
        this._loadingService.hide();
        this.openFilter = false;
      }
    });
}
  addOne(): void {
    this._router.navigate(['add'], { relativeTo: this._route }).then();
  }
  openShow(row: User) {
    this._router.navigate([`${row._id}`], { relativeTo: this._route }).then();
  }
  openEdit(row: User) {
    this._router.navigate([`${row._id}/edit`], { relativeTo: this._route }).then();
  }
  updateSearch() {
    clearTimeout(this.typingTimer);
    this.filterOptions.search = this.filterSearch;
    this.typingTimer = setTimeout(() => {
      this.paginator?.firstPage();
      this.getList();
    }, this.doneTypingInterval);
  }
  ArchiveOne(row: User) {
    // Open the confirmation dialog
    const confirmation = this._fuseConfirmationService.open({
      title: 'Archive',
      message: 'Would you like to confirm  Archiving ?',
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
          this.getList();
        });
      }
    });
  }
  deleteOne(row: User) {
    const confirmation = this._fuseConfirmationService.open({
      title: 'Delete',
      message: 'Are you sure you want to delete this user?',
      actions: {
        confirm: {
          label: 'Delete',
        },
        cancel: {
          label: 'Cancel',
        },
      },
    });

    confirmation.afterClosed().subscribe((result) => {
      if (result === 'confirmed') {
        this._userService.deleteOne(row._id).subscribe(() => {
          this.getList();
        });
      }
    });
  }

  restoreOne(row: User) {
    const confirmation = this._fuseConfirmationService.open({
      title: 'Restore',
      message: 'Do you want to restore this user?',
      actions: {
        confirm: {
          label: 'Restore',
        },
        cancel: {
          label: 'Cancel',
        },
      },
    });

    confirmation.afterClosed().subscribe((result) => {
      if (result === 'confirmed') {
        this._userService.restoreOne(row._id).subscribe(() => {
          this.getList();
        });
      }
    });
  }

 
resetFilters() {
  this.filtergroups = [];
  this.filterstatus = [];
  this.filterCompany=[]
  this.filterarchived = false;
}

applyFilter(){
  this.currentPage=1
  this.getList()
}
}
