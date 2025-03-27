import { Component, OnInit } from '@angular/core';
import { FormControl, NgForm, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { fuseAnimations } from '../../../../../../@fuse/animations';
import { environment } from '../../../../../../environments/environment';
import { SnackBarService } from '../../../../../shared/services/snack-bar.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseConfirmationService } from '../../../../../../@fuse/services/confirmation';
import { BreadcrumbService } from 'xng-breadcrumb';
import { FeatureService } from '../../../../../shared/services/feature.service';
import { Feature } from '../../../../../shared/models/feature';
import { UserService } from '../../../../../shared/services/user.service';
import { User } from '../../../../../shared/models/user';
import { UserFeaturesService } from '../../../../../shared/services/user-features.service';
import { UserFeature } from '../../../../../shared/models/user-feature';
import { TranslocoModule } from '@jsverse/transloco';
import { MatIcon } from '@angular/material/icon';
import { MatRadioButton } from '@angular/material/radio';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatTooltip } from '@angular/material/tooltip';
import { MatOption } from '@angular/material/core';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatSelect, MatSelectTrigger } from '@angular/material/select';
import { MatFormField, MatError } from '@angular/material/form-field';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatProgressBar } from '@angular/material/progress-bar';
import { Observable, startWith } from 'rxjs';
import { map } from 'rxjs/operators';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-details',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss'],
  animations: fuseAnimations,
  standalone: true,
  imports: [
    FormsModule,
    MatProgressBar,
    MatButton,
    MatFormField,
    MatSelect,
    MatSelectTrigger,
    NgxMatSelectSearchModule,
    ReactiveFormsModule,
    MatOption,
    MatError,
    MatTooltip,
    MatSlideToggle,
    MatRadioButton,
    MatIconButton,
    MatIcon,
    TranslocoModule,
    AsyncPipe,
  ],
})
export class AddComponent implements OnInit {
  url = `${environment.services.i18n.url}/assets/`;
  loading = false;
  isLoading: any;
  filteredListGroups: any;
  featureId: Feature[] = [];
  filteredList = [];
  listFeature: Feature[];
  type: boolean[] = [true, true, true, true, true, true];
  groupFeature: UserFeature[] = [new UserFeature()];
  listUsers: User[];
  filteredListUsers: Observable<User[]>;
  user: User = new User();
  userFilterControl: FormControl<any> = new FormControl();

  constructor(
    private featureService: FeatureService,
    private userService: UserService,
    private _router: Router,
    private snackBarService: SnackBarService,
    private userFeaturesService: UserFeaturesService,
    private _fuseConfirmationService: FuseConfirmationService,
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
  ) {}

  ngOnInit(): void {
    this.breadcrumbService.set('home/userfeatures/add', 'Add');

    this.featureService.getAllFeature().subscribe(
      (feature) => {
        this.listFeature = feature;
        this.filteredList.push(feature);
      },
      () => {},
    );
    this.userFeaturesService.getUserWithoutFeatures().subscribe((users) => {
      this.listUsers = users;
      this.filteredListUsers = this.userFilterControl.valueChanges.pipe(
        startWith(''),
        map((value) => this._filterUser(value)),
      );
    });
    this.groupFeature[0] = {
      list: true,
      create: true,
      read: true,
      update: true,
      delete: true,
      status: true,
      defaultFeature: false,
    };
  }
  _filterUser(value: string): User[] {
    const filterValue = value.toLowerCase();
    return this.listUsers.filter((user: User) => user.name.toLowerCase().includes(filterValue));
  }
  createGroup(myForm: NgForm): void {
    if (myForm.valid) {
      if (!this.groupFeature[0].featuresId?._id) {
        this.snackBarService.openSnackBar('Feature is required', 'error');
      } else {
        if (!this.groupFeature[this.groupFeature.length]) {
          this.groupFeature.splice(this.groupFeature.length, 1);
        }
        if (
          this.groupFeature.filter((value) => value.defaultFeature).length === 0 &&
          !this.user.groupsId
        ) {
          this.snackBarService.openSnackBar('Default feature is required for this user', 'error');
        } else {
          this.userFeaturesService.creatUserFeatures(this.user, this.groupFeature).subscribe(() => {
            this._router.navigate([`../${this.user._id}`], { relativeTo: this.route });
          });
        }
      }
    }
  }

  resetForm(myForm: NgForm, event) {
    event.stopPropagation();
    if (myForm.pristine && this.featureId.length === 0) {
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
          this.user = null;
          this.filteredList = [];
          this.filteredList.push(this.listFeature);
          this.featureId = [];
          this.groupFeature = [
            {
              featuresId: null,
              list: true,
              create: true,
              update: true,
              read: true,
              delete: true,
              status: true,
              defaultFeature: false,
            },
          ];
        }
      });
    }
  }

  cancelForm(myForm: NgForm) {
    if (myForm.pristine && this.featureId.length === 0) {
      this._router.navigate([`../`], { relativeTo: this.route });
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
          this._router.navigate([`../`], { relativeTo: this.route });
        }
      });
    }
  }

  addRow(index, value): void {
    if (value) {
      this.featureId[index] = value;
      this.groupFeature[index].featuresId = value;
      this.filteredList.push(this.listFeature);
      if (
        this.groupFeature[index] &&
        this.groupFeature.length - 1 === index &&
        this.groupFeature.length !== this.listFeature.length
      ) {
        this.groupFeature.push(new UserFeature());
        this.groupFeature[index + 1] = {
          list: true,
          create: true,
          read: true,
          update: true,
          delete: true,
          status: true,
          defaultFeature: false,
        };
      }
    } else {
      this.deleteRow(index);
    }
  }

  deleteRow(index) {
    this.groupFeature.splice(index, 1);
    this.featureId.splice(index, 1);
    if (this.groupFeature[this.groupFeature.length - 1].featuresId) {
      this.groupFeature.push({
        featuresId: null,
        list: true,
        create: true,
        update: true,
        read: true,
        delete: true,
        status: true,
        defaultFeature: false,
      });
    }
  }

  /**
   * Track by function for ngFor loops
   *
   * @param index
   * @param item
   */
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  grantAll(event) {
    event.stopPropagation();
    this.filteredList = this.listFeature.map(() => this.listFeature);
    this.featureId = this.listFeature.map((value) => value);
    this.groupFeature = this.listFeature.map((value) => ({
      featuresId: value,
      list: true,
      create: true,
      update: true,
      read: true,
      delete: true,
      status: true,
      defaultFeature: false,
    }));
    this.type = [true, true, true, true, true, true];
  }

  revokeAll(event) {
    event.stopPropagation();
    this.filteredList = [];
    this.filteredList.push(this.listFeature);
    this.featureId = [];
    this.groupFeature = [
      {
        featuresId: null,
        list: true,
        create: true,
        update: true,
        read: true,
        delete: true,
        status: true,
        defaultFeature: false,
      },
    ];
    this.type = [false, false, false, false, false, false];
  }

  activate(type: string) {
    for (const group of this.groupFeature) {
      if (type === 'list') {
        group.list = !this.type[0] ? true : false;
      }
      if (type === 'create') {
        group.create = !this.type[1] ? true : false;
      }
      if (type === 'read') {
        group.read = !this.type[2] ? true : false;
      }
      if (type === 'update') {
        group.update = !this.type[3] ? true : false;
      }
      if (type === 'delete') {
        group.delete = !this.type[4] ? true : false;
      }
      if (type === 'status') {
        if (!this.type[5]) {
          group.status = true;
        } else {
          group.status = false;
          group.defaultFeature = false;
        }
      }
    }
    if (type === 'list') {
      this.type[0] = !this.type[0];
    }
    if (type === 'create') {
      this.type[1] = !this.type[1];
    }
    if (type === 'read') {
      this.type[2] = !this.type[2];
    }
    if (type === 'update') {
      this.type[3] = !this.type[3];
    }
    if (type === 'delete') {
      this.type[4] = !this.type[4];
    }
    if (type === 'status') {
      this.type[5] = !this.type[5];
    }
  }

  testActivate(type: string) {
    if (type === 'list' && this.type[0]) {
      this.type[0] = false;
    }
    if (type === 'create' && this.type[1]) {
      this.type[1] = false;
    }
    if (type === 'read' && this.type[2]) {
      this.type[2] = false;
    }
    if (type === 'update' && this.type[3]) {
      this.type[3] = false;
    }
    if (type === 'delete' && this.type[4]) {
      this.type[4] = false;
    }
    if (type === 'status' && this.type[4]) {
      this.type[5] = false;
    }
  }

  default(index) {
    this.groupFeature.map((value) => {
      value.defaultFeature = false;
    });
    this.groupFeature[index].defaultFeature = true;
  }

  checkDefault(index) {
    if (
      !this.groupFeature[index].featuresId ||
      !this.groupFeature[index].featuresId.link ||
      !this.groupFeature[index].status
    ) {
      this.groupFeature[index].defaultFeature = false;
    }
  }
}
