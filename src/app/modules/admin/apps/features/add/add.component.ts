import {Component, inject, OnInit} from '@angular/core';
import { FormControl, NgForm, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Feature } from '../../../../../shared/models/feature';
import { fuseAnimations } from '../../../../../../@fuse/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseConfirmationService } from '../../../../../../@fuse/services/confirmation';
import { listFeatureStatus } from '../../../../../shared/enums/featureStatus';
import { listFeatureType, FeatureType } from '../../../../../shared/enums/featureType';
import { FeatureService } from '../../../../../shared/services/feature.service';
import { material } from '../../../../../mock-api/ui/icons/data';
import { MatIcon } from '@angular/material/icon';
import { MatOption } from '@angular/material/core';
import { MatSelect, MatSelectTrigger} from '@angular/material/select';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatButton } from '@angular/material/button';
import {TranslocoPipe} from "@ngneat/transloco";
import {LoadingService} from "../../../../../shared/services/loading.service";
import {forkJoin} from "rxjs";

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
        MatSelect,
        MatSelectTrigger,
        MatOption,
        ReactiveFormsModule,
        MatIcon,
        TranslocoPipe,
    ],
})
export class AddComponent implements OnInit {
    //********* INJECT SERVICES ***********//
    _featureService= inject(FeatureService);
    _router= inject(Router);
    _fuseConfirmationService= inject(FuseConfirmationService);
    _route= inject(ActivatedRoute);
    _loadingService = inject(LoadingService)
    //********* DECLARE CLASSES/ENUMS ***********//
    feature = new Feature();
    listParentFeatures: Feature[] = [];

    readonly FeatureType = FeatureType;
    listFeatureStatus = listFeatureStatus;
    listFeatureType = listFeatureType;
    filteredListIcons = [];
    filteredListFeature = [];
    listIcons = [];
    divider: string;
    iconFilterControl: FormControl<any> = new FormControl();

  ngOnInit(): void {
    this.listIcons = material;
    this.filteredListIcons = material;
    this._loadingService.show();
    forkJoin([
        this._featureService.getFeatureParent()
    ]).subscribe({
        next:(result:[Feature[]]) => {
            this.listParentFeatures = result[0];
            this._loadingService.hide();
        },
        error: () => {
            this._loadingService.hide();
        }
    })
    this.feature.divider = true;
  }
  addFeature(myForm: NgForm): void {
    if (myForm.valid) {
      this.feature.divider = this.divider === 'true';
      if (this.feature.type === FeatureType.group) {
        this.feature.link = null;
      } else {
        this.feature.subtitle = null;
      }
        console.log(this.feature)
      this._featureService.createFeature(this.feature).subscribe(() => {
        this._router.navigate([`../`], { relativeTo: this._route }).then();
      });
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
          this._router.navigate([`../`], { relativeTo: this._route }).then();
        }
      });
    }
  }
}
