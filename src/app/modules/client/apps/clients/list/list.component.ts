import { group } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatFormField, MatLabel, MatPrefix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSelect } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoPipe } from '@ngneat/transloco';
import { FeaturesDirective } from 'app/shared/directives/features.directive';
import { FeatureActions } from 'app/shared/enums/feature-actions';
import { FeatureCodes } from 'app/shared/enums/feature-codes';
import { Company } from 'app/shared/models/company';
import { FilterOptions } from 'app/shared/models/filter-options';
import { Pagination } from 'app/shared/models/pagination';
import { User } from 'app/shared/models/user';
import { AuthService } from 'app/shared/services/auth.service';
import { CompanyService } from 'app/shared/services/company.service';
import { GroupService } from 'app/shared/services/group.service';
import { LoadingService } from 'app/shared/services/loading.service';
import { UserService } from 'app/shared/services/user.service';

@Component({
  selector: 'app-list',
  imports: [MatFormField,
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
      MatLabel,
    MatOption,
  MatSelect],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit {

  //********* INJECT SERVICES ***********//
  _userService= inject(UserService);
  _companyService= inject(CompanyService);
  _groupService=inject(GroupService)
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
  featureCodes = FeatureCodes;
  featureActions = FeatureActions;
  showArchived=false;
  groups:any[]=[];
  companyId:string;
  //************* FILTERS *****************//
  openFilter = false;
  filterGroup: string[] = [];
  filterStatus: string[] = [];
  filterArchived: boolean;
  filterSearch: string;
  connectedUser: any;
  authService= inject(AuthService);
  
  ngOnInit(): void {
    this.connectedUser= localStorage.getItem("connectedUserId")
    this.companyId=localStorage.getItem("connectedUserCompany")
    this.loadGroups()
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
  loadGroups(): void {
    
    this._groupService.getGroupsByCompany(
      this.companyId,
      "external"
    ).subscribe((groups) => {
      
      this.groups = groups;
      
    });
}
  
  getList(): void {
  
    
    this._loadingService.show();
    this._userService
      .getClients(
        this.currentSize.toString(),
        this.currentPage.toString(),
        this.filterSearch,
        this.companyId,
        this.filterArchived,
        this.filterGroup,
        this.filterStatus
      )
      .subscribe({ 
        
          next: results => {
            

            const filteredUsers = results.data.filter(user => 
              user.type === 'external' &&
              user.companyId==this.companyId
            );
            
            this.displayedList = {
              ...results,
              data: filteredUsers
            };
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
  openEditDetails(row: User) {
    this._router.navigate([`${row._id}/editDetails`], { relativeTo: this._route }).then();
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
  resetFilters() {
  this.filterGroup = [];
  this.filterStatus = [];
  this.showArchived = false;
}
}
