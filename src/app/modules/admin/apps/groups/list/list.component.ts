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
  _groupService= inject(GroupService);
  _router= inject(Router);
  _fuseConfirmationService= inject(FuseConfirmationService);
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
  getList(): void {
    this._loadingService.show();
    this._groupService
      .getList(
        this.currentSize.toString(),
        this.currentPage.toString(),
        this.filterSearch,
        this.filterType.toString(),
        this.filterStatus.toString(),
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
}
