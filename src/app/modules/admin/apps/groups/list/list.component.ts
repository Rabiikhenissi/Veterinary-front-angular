import {Component, inject, OnInit, ViewChild} from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import { FilterOptions } from '../../../../../shared/models/filter-options';
import { Group } from '../../../../../shared/models/group';
import { Pagination } from '../../../../../shared/models/pagination';
import { GroupService } from '../../../../../shared/services/group.service';
import { FuseConfirmationService } from '../../../../../../@fuse/services/confirmation';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatButton, MatIconButton } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInput, MatLabel} from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatPrefix } from '@angular/material/form-field';
import {TranslocoPipe} from "@ngneat/transloco";
import {LoadingService} from "../../../../../shared/services/loading.service";
import { FeaturesDirective } from 'app/shared/directives/features.directive';
import { FeatureCodes } from 'app/shared/enums/feature-codes';
import { FeatureActions } from 'app/shared/enums/feature-actions';
import { MatOption, MatSelect } from '@angular/material/select';
import { CompanyService } from 'app/shared/services/company.service';
import { Company } from 'app/shared/models/company';
import { CommonModule } from '@angular/common';
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
        MatSelect,
        MatOption,
        CommonModule
    ],
})
export class ListComponent implements OnInit {
  //********* INJECT SERVICES ***********//
  _groupService= inject(GroupService);
  _router= inject(Router);
  _fuseConfirmationService= inject(FuseConfirmationService);
  _companyService=inject(CompanyService)
  _route= inject(ActivatedRoute);
  _loadingService = inject(LoadingService)
  @ViewChild(MatPaginator) paginator: MatPaginator;
  filterOptions: FilterOptions = new FilterOptions();
  currentSize = 10;
  currentPage = 1;
  displayedList: Pagination<Group>;
  typingTimer;
  doneTypingInterval = 500;
  isScreenSmall: boolean;
  //************* FILTERS *****************//
  openFilter = false;
  filterType: string[] = [];
  filterCompany: string[] = [];
  filterArchived: boolean=false;
  filterSearch:string;
 featureCodes = FeatureCodes;
  featureActions = FeatureActions;
  companies:Company[]=[]
  ngOnInit(): void {
  this._loadingService.show();
  forkJoin({
    companies: this._companyService.getAll(),
    groups: this._groupService.getList({
      limit: this.currentSize.toString(),
      page: this.currentPage.toString(),
      search: this.filterSearch,
      types: this.filterType,
      companies: this.filterCompany,
      archived: this.filterArchived,
    })
  }).subscribe({
    next: ({ companies, groups }) => {
      this.companies = companies.data;
      this.displayedList = groups;
      this._loadingService.hide();
    },
    error: () => {
      this._loadingService.hide();
    }
  });
}
  getCompanies(): void {
    this._companyService.getAll().subscribe({
      next: (res) => {
        this.companies = res.data;
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
  getList(): void {
    this._loadingService.show();
    this._groupService
      .getList({
        limit:this.currentSize.toString(),
  page:this.currentPage.toString(),
  search:this.filterSearch,
  types:this.filterType,
  companies:this.filterCompany,
  archived:this.filterArchived,}
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
  addGroup(): void {
    this._router.navigate(['add'], { relativeTo: this._route }).then();
  }

archiveOne(row: Group) {
  const confirmation = this._fuseConfirmationService.open({
    title: 'Archive',
    message: 'Would you like to confirm archiving this group?',
    actions: {
      confirm: { label: 'Yes' },
      cancel: { label: 'No' },
    },
  });

  confirmation.afterClosed().subscribe((result) => {
    if (result === 'confirmed') {
      this._groupService.archiveOne(row._id).subscribe(() => {
        this.getList();
      });
    }
  });
}

restoreOne(row: Group) {
  const confirmation = this._fuseConfirmationService.open({
    title: 'Restore',
    message: 'Do you want to restore this group?',
    actions: {
      confirm: { label: 'Restore' },
      cancel: { label: 'Cancel' },
    },
  });

  confirmation.afterClosed().subscribe((result) => {
    if (result === 'confirmed') {
      this._groupService.restoreOne(row._id).subscribe(() => {
        this.getList();
      });
    }
  });
}

  openShow(row: Group) {
    this._router.navigate([`${row._id}`], { relativeTo: this._route }).then();
  }
  openEdit(group: Group) {
    this._router.navigate([`${group._id}/edit`], { relativeTo: this._route }).then();
  }
  updateSearch() {
    clearTimeout(this.typingTimer);
    this.filterOptions.search = this.filterSearch;
    this.typingTimer = setTimeout(() => {
      this.paginator?.firstPage();
      this.getList();
    }, this.doneTypingInterval);
  }
  deleteGroup(group: Group) {
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
        this._groupService.deleteOne(group._id).subscribe(() => {
          this.getList();
        });
      }
    });
  }
  refresh(): void {
    clearTimeout(this.typingTimer);
    this.typingTimer = setTimeout(() => {
      this.getList();
    }, this.doneTypingInterval);
  }

  resetFilters() {
  this.filterType = [];
  this.filterCompany=[]
  this.filterArchived = false;
}
}
