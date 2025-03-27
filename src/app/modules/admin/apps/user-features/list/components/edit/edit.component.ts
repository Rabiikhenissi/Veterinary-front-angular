import { Component, OnInit } from '@angular/core';

import { environment } from '../../../../../../../../environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { SnackBarService } from '../../../../../../../shared/services/snack-bar.service';
import { BreadcrumbService } from 'xng-breadcrumb';
import { FuseConfirmationService } from '../../../../../../../../@fuse/services/confirmation';
import { Feature } from '../../../../../../../shared/models/feature';
import { FeatureService } from '../../../../../../../shared/services/feature.service';
import { FormControl, NgForm, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { User } from '../../../../../../../shared/models/user';
import { UserFeature } from '../../../../../../../shared/models/user-feature';
import { UserFeaturesService } from '../../../../../../../shared/services/user-features.service';
import { UserService } from '../../../../../../../shared/services/user.service';
import { TranslocoModule } from '@jsverse/transloco';
import { MatRadioButton } from '@angular/material/radio';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatOption } from '@angular/material/core';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatSelect, MatSelectTrigger } from '@angular/material/select';
import { MatTooltip } from '@angular/material/tooltip';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatProgressBar } from '@angular/material/progress-bar';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    MatProgressBar,
    MatButton,
    MatIcon,
    MatFormField,
    MatLabel,
    MatInput,
    MatTooltip,
    MatSelect,
    MatSelectTrigger,
    NgxMatSelectSearchModule,
    ReactiveFormsModule,
    MatOption,
    MatSlideToggle,
    MatRadioButton,
    MatIconButton,
    TranslocoModule,
  ],
})
export class EditComponent implements OnInit {
  isLoading: boolean;
  user = new User();
  url = `${environment.services.i18n.url}/assets/`;
  id: string;
  userFeature: UserFeature[];
  testGroup: UserFeature[];
  featureId: Feature[] = [];
  listFeature: Feature[] = [];
  filteredList = [];
  featureWithId: string[] = [];
  type: boolean[] = [true, true, true, true, true, true];
  index: number;
  label: string;
  usersId: User;
  featureFilterControls: FormControl<any> = new FormControl();
  constructor(
    private userFeaturesService: UserFeaturesService,
    private featureService: FeatureService,
    private _router: Router,
    private snackBarService: SnackBarService,
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    private _fuseConfirmationService: FuseConfirmationService,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((param) => {
      this.id = param.get('id');

      if (this.id) {
        this.featureService.getAllFeature().subscribe(
          (feature) => {
            this.listFeature = feature;
            this.filteredList.push(this.listFeature);
          },
          () => {},
        );
        this.userService.getSingleUserProfile(this.id).subscribe(
          (user) => {
            this.user = user;
            this.usersId = {
              _id: this.user._id,
              companyId: this.user.companyId,
            };
            this.label = `${this.user?.name}(${this.user?.email})`;
            this.breadcrumbService.set('home/userfeatures/:id', this.user.name);
            this.userFeaturesService.getUserFeatures(this.user._id).subscribe(
              (userFeature) => {
                this.userFeature = userFeature;
                this.userFeature.map((usersFeature) => (usersFeature.usersId = this.usersId));
                this.testGroup = userFeature;
                this.filteredList = this.listFeature.map(() => this.listFeature);
                this.featureId = this.userFeature.map((value) => value.featuresId);
                this.featureWithId = this.featureId.map((site) => site._id);
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                if (this.userFeature.length !== this.listFeature.length) {
                  this.userFeature.push({
                    featuresId: null,
                    list: true,
                    create: true,
                    update: true,
                    read: true,
                    delete: true,
                    status: true,
                    defaultFeature: false,
                    usersId: this.usersId,
                  });
                }
              },
              () => {},
            );
          },
          () => {},
        );
      }
    });
  }
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }
  deletegroup() {
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
        this.userFeaturesService.deleteUser(this.id).subscribe(() => {
          this._router.navigate(['/home/userfeatures']);
        });
      }
    });
  }
  grantAll(event) {
    event.stopPropagation();
    this.filteredList = this.listFeature.map(() => this.listFeature);
    //this.featureId = this.listFeature.map((value) => value);
    let i = 0;
    for (const group of this.userFeature) {
      if (group.featuresId === null) {
        this.userFeature.splice(i, 1);
      }
      i++;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const feature of this.listFeature) {
      if (!this.featureId.map((value) => value._id).includes(feature._id) && feature._id) {
        this.featureId.push(feature);
        this.userFeature.push({
          featuresId: feature,
          list: true,
          create: true,
          update: true,
          read: true,
          delete: true,
          status: true,
          defaultFeature: false,
          usersId: this.usersId,
        });
      }
      this.index++;
    }
    this.featureWithId = this.listFeature.map((site) => site._id);
  }

  revokeAll(event) {
    event.stopPropagation();
    this.filteredList = [];
    this.filteredList.push(this.listFeature);
    this.featureId = [];
    this.userFeature = [
      {
        featuresId: null,
        list: true,
        create: true,
        update: true,
        read: true,
        delete: true,
        status: true,
        defaultFeature: false,
        usersId: this.usersId,
      },
    ];
    this.type = [true, true, true, true, true, true];
    this.featureWithId = [];
  }
  deleteRow(index) {
    this.featureId.splice(index, 1);
    this.userFeature[index] = this.userFeature[index + 1];
    this.userFeature.splice(index, 1);
    if (this.userFeature[this.userFeature.length - 1].featuresId) {
      this.userFeature.push({
        featuresId: null,
        list: true,
        create: true,
        update: true,
        read: true,
        delete: true,
        status: true,
        defaultFeature: false,
        usersId: this.usersId,
      });
    }
    this.featureWithId.splice(index, 1);
  }
  addRow(index, value): void {
    if (value !== null) {
      this.featureId[index] = this.listFeature.filter((val) => val._id === value)[0];
      this.featureWithId[index] = value;
      this.userFeature[index].featuresId = this.listFeature.filter((val) => val._id === value)[0];
      this.filteredList.push(this.listFeature);
      if (
        this.userFeature[index] &&
        this.userFeature.length - 1 === index &&
        this.userFeature.length !== this.listFeature.length
      ) {
        this.userFeature.push({
          featuresId: null,
          list: true,
          create: true,
          read: true,
          update: true,
          delete: true,
          status: true,
          defaultFeature: false,
          usersId: this.usersId,
        });
      }
    } else {
      this.deleteRow(index);
    }
  }
  cancelEdit(myForm: NgForm) {
    if (myForm.pristine && this.testGroup === this.userFeature) {
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
  updateGroup(): void {
    if (!this.userFeature[0].featuresId?._id) {
      this.snackBarService.openSnackBar('feature is required', 'error');
    } else {
      if (
        this.userFeature.filter((value) => value.defaultFeature).length === 0 &&
        !this.user.groupsId
      ) {
        this.snackBarService.openSnackBar('Default feature is required for this user', 'error');
      } else {
        this.userFeaturesService.updateUser(this.userFeature).subscribe(() => {
          this._router.navigate(['../'], { relativeTo: this.route });
        });
      }
    }
  }
  activate(type: string) {
    for (const group of this.userFeature) {
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
    if (type === 'status' && this.type[5]) {
      this.type[5] = false;
    }
  }
  default(index) {
    this.userFeature.map((value) => {
      value.defaultFeature = false;
    });
    this.userFeature[index].defaultFeature = true;
  }

  checkDefault(index) {
    if (
      !this.userFeature[index].featuresId ||
      !this.userFeature[index].featuresId.link ||
      !this.userFeature[index].status
    ) {
      this.userFeature[index].defaultFeature = false;
    }
  }
}
