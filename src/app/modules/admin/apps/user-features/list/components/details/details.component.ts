import { Component, OnInit } from '@angular/core';

import { environment } from '../../../../../../../../environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { SnackBarService } from '../../../../../../../shared/services/snack-bar.service';
import { BreadcrumbService } from 'xng-breadcrumb';
import { FuseConfirmationService } from '../../../../../../../../@fuse/services/confirmation';
import { UserFeature } from '../../../../../../../shared/models/user-feature';
import { Feature } from '../../../../../../../shared/models/feature';
import { FeatureService } from '../../../../../../../shared/services/feature.service';
import { User } from '../../../../../../../shared/models/user';
import { UserService } from '../../../../../../../shared/services/user.service';
import { UserFeaturesService } from '../../../../../../../shared/services/user-features.service';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';
import { MatRadioButton } from '@angular/material/radio';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatOption } from '@angular/material/core';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatSelect, MatSelectTrigger } from '@angular/material/select';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatProgressBar } from '@angular/material/progress-bar';
@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    MatProgressBar,
    MatButton,
    MatIcon,
    MatFormField,
    MatLabel,
    MatInput,
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
export class DetailsComponent implements OnInit {
  isLoading: boolean;
  user = new User();
  url = `${environment.services.i18n.url}/assets/`;
  id: string;
  userFeature: UserFeature[];
  featureId: Feature[] = [];
  listFeature: Feature[] = [];
  filteredList = [];
  label: string;
  featureFilterControl: FormControl<any> = new FormControl();
  constructor(
    private userService: UserService,
    private featureService: FeatureService,
    private _router: Router,
    private snackBarService: SnackBarService,
    private route: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    private _fuseConfirmationService: FuseConfirmationService,
    private userFeaturesService: UserFeaturesService,
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
            this.label = `${this.user?.name}(${this.user?.email})`;
            this.breadcrumbService.set('home/userfeatures/:id', this.user.name);
            this.userFeaturesService.getUserFeatures(this.user._id).subscribe(
              (userFeature) => {
                this.userFeature = userFeature;
                this.filteredList = this.listFeature.map(() => this.listFeature);
                this.featureId = this.userFeature.map((value) => value.featuresId);
              },
              () => {},
            );
          },
          () => {},
        );
      }
    });
  }
  addUser() {
    this._router.navigate(['/home/userfeatures/add']);
  }

  editUser() {
    this._router.navigate([`/home/userfeatures/${this.user._id}/edit`]);
  }
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }
  deleteUser() {
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
}
