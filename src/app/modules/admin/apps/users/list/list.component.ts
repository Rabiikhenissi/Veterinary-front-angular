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
import { MatFormField, MatPrefix } from '@angular/material/form-field';
import {TranslocoPipe} from "@ngneat/transloco";
import {LoadingService} from "../../../../../shared/services/loading.service";
import { UserService } from 'app/shared/services/user.service';
import {User} from "../../../../../shared/models/user";
import { CompanyService } from 'app/shared/services/company.service';
import { Company } from 'app/shared/models/company';

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
  filterOptions: FilterOptions = new FilterOptions();
  currentSize = 10;
  currentPage = 1;
  displayedList: Pagination<User>;
  typingTimer;
  doneTypingInterval = 500;
  isScreenSmall: boolean;
  //************* FILTERS *****************//
  openFilter = false;
  filterType: string[] = [];
  filterStatus: string[] = [];
  filterSearch: string;

  ngOnInit(): void {
    this.getList();
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
  getCompany(companyId: string) {
    if (!companyId) return ''; 

    if (this.companyNames.has(companyId)) {
      return this.companyNames.get(companyId);
    }
      this._companyService.getOne(companyId).subscribe((company: Company) => {
      this.companyNames.set(companyId, company.name);
    });
  
    return ''; 
  }
  getList(): void {
    this._loadingService.show();
    this._userService
      .getUsers(
        this.currentSize.toString(),
        this.currentPage.toString(),
        this.filterSearch,
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
          this.getList();
        });
      }
    });
  }
}
