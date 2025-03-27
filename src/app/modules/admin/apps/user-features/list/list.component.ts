import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../../../../../shared/services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseConfirmationService } from '../../../../../../@fuse/services/confirmation';
import { FuseMediaWatcherService } from '../../../../../../@fuse/services/media-watcher';
import { User } from '../../../../../shared/models/user';
import { MatPaginator } from '@angular/material/paginator';
import { FilterOptions } from '../../../../../shared/models/filter-options';
import { Group } from '../../../../../shared/models/group';
import { Pagination } from '../../../../../shared/models/pagination';
import { environment } from '../../../../../../environments/environment';
import { UserFeaturesService } from '../../../../../shared/services/user-features.service';
import { TranslocoModule } from '@jsverse/transloco';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { MatButton, MatIconButton } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatPrefix } from '@angular/material/form-field';
import { MatProgressBar } from '@angular/material/progress-bar';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  standalone: true,
  imports: [
    MatProgressBar,
    MatFormField,
    MatIcon,
    MatPrefix,
    MatInput,
    FormsModule,
    MatButton,
    MatSort,
    MatSortHeader,
    MatIconButton,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    MatPaginator,
    TranslocoModule,
  ],
})
export class ListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  filterOptions: FilterOptions = new FilterOptions();
  group: Group;
  currentSize = 10;
  currentPage = 1;
  displayedList: Pagination<User>;
  typingTimer;
  doneTypingInterval = 500;
  user: User;
  connectedUser: User;
  url = `${environment.api}/public/`;
  urlFlag = `${environment.services.i18n.url}/assets/`;
  isScreenSmall: boolean;
  path: string;
  searchFilter: string;
  isLoading = false;
  count: number;
  sortCode: string;
  sortName: string;
  sortEmail: string;

  constructor(
    private userService: UserService,
    private userFeaturesService: UserFeaturesService,
    private _router: Router,
    private route: ActivatedRoute,
    private _fuseMediaWatcherService: FuseMediaWatcherService,
    private _fuseConfirmationService: FuseConfirmationService,
  ) {}

  ngOnInit(): void {
    // Subscribe to media changes
    this.filterOptions.userFeatureId = ' ';

    this._fuseMediaWatcherService.onMediaChange$.subscribe(({ matchingAliases }) => {
      // Check if the screen is small
      this.isScreenSmall = !matchingAliases.includes('sm');
    });
    // eslint-disable-next-line prefer-destructuring
    this.path = window.location.pathname.split('/apps/')[1];
    this.userService.getUserProfile().subscribe(
      (res: User) => {
        this.connectedUser = res;
      },
      () => {},
    );
    this.getList();
  }
  pageChanged(event): void {
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
    this.isLoading = true;
    this.userFeaturesService
      .getUserWithFeatures(
        this.currentSize,
        this.currentPage,
        this.filterOptions.sortCode,
        this.filterOptions.sortName,
        this.filterOptions.sortEmail,
        this.filterOptions.search,
        this.filterOptions.userFeatureId,
      )
      .subscribe(
        (res: Pagination<User>) => {
          this.displayedList = res;
          this.isLoading = false;
        },
        () => {
          this.isLoading = false;
        },
      );
  }
  refresh(): void {
    clearTimeout(this.typingTimer);
    this.typingTimer = setTimeout(() => {
      this.getList();
    }, this.doneTypingInterval);
  }
  openShow(row) {
    this._router.navigate([`${row._id}`], { relativeTo: this.route });
  }
  openEdit(group) {
    this._router.navigate([`${group._id}/edit`], { relativeTo: this.route });
  }
  updateSearch() {
    clearTimeout(this.typingTimer);
    this.filterOptions.search = this.searchFilter;
    this.isLoading = true;
    this.typingTimer = setTimeout(() => {
      this.paginator?.firstPage();
      this.getList();
    }, this.doneTypingInterval);
  }
  updateSort(sort) {
    this.isLoading = true;
    switch (sort) {
      case 'sortCode':
        if (this.sortCode === 'up') {
          this.sortCode = 'down';
        } else {
          this.sortCode = 'up';
        }
        this.filterOptions.sortName = null;
        this.filterOptions.sortCode = this.sortCode;
        break;
      case 'sortName':
        if (this.sortName === 'up') {
          this.sortName = 'down';
        } else {
          this.sortName = 'up';
        }
        this.filterOptions.sortCode = null;
        this.filterOptions.sortName = this.sortName;
        break;
      case 'sortEmail':
        if (this.sortEmail === 'up') {
          this.sortEmail = 'down';
        } else {
          this.sortEmail = 'up';
        }
        this.filterOptions.sortName = null;
        this.filterOptions.sortCode = null;
        this.filterOptions.sortEmail = this.sortEmail;
        break;
      default:
        break;
    }
    this.getList();
  }
  addUser(): void {
    this._router.navigate(['add'], { relativeTo: this.route });
  }
  deleteUser(user) {
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
        this.userFeaturesService.deleteUser(user._id).subscribe(() => {
          this.getList();
        });
      }
    });
  }
}
