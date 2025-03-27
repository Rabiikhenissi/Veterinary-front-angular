import {Component, inject, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseConfirmationService } from '../../../../../../../../@fuse/services/confirmation';
import { Feature } from '../../../../../../../shared/models/feature';
import { FeatureService } from '../../../../../../../shared/services/feature.service';
import { NgForm, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { material } from '../../../../../../../mock-api/ui/icons/data';
import { listFeatureStatus } from '../../../../../../../shared/enums/featureStatus';
import { listFeatureType, FeatureType } from '../../../../../../../shared/enums/featureType';
import { MatOption } from '@angular/material/core';
import { MatSelect, MatSelectTrigger } from '@angular/material/select';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import {TranslocoModule} from "@ngneat/transloco";
import {forkJoin} from "rxjs";
import {LoadingService} from "../../../../../../../shared/services/loading.service";
@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  imports: [
    FormsModule,
    MatButton,
    MatIcon,
    MatFormField,
    MatLabel,
    MatInput,
    MatError,
    MatSelect,
    MatSelectTrigger,
    MatOption,
    ReactiveFormsModule,
    TranslocoModule,
  ],
})
export class EditComponent implements OnInit {
    //********* INJECT SERVICES ***********//
    _featureService= inject(FeatureService);
    _router= inject(Router);
    _route= inject(ActivatedRoute);
    _fuseConfirmationService= inject(FuseConfirmationService);
    _loadingService= inject(LoadingService);
    //********* DECLARE CLASSES/ENUMS ***********//
    id = this._route.snapshot.paramMap.get('id') || undefined;
    readonly FeatureType = FeatureType;
    listFeatureStatus = listFeatureStatus;
    listFeatureType = listFeatureType;
    filteredListIcons = [];
    listFeature = [];
    listIcons = [];
    divider: string;
    feature: Feature;
    ngOnInit(): void {
        if (this.id) {
            this._loadingService.show()
            forkJoin([
                this._featureService.getFeature(this.id),
                this._featureService.getFeatureParent(),
            ]).subscribe({
                next: (result:[Feature, Feature[]]) => {
                    this.feature = result[0];
                    this.listFeature = result[1];
                    console.log(this.feature);
                    if ( this.feature.featuresIdParent) {
                        this.feature.featuresIdParent = this.listFeature.filter(
                            (l: Feature) => l._id ===  this.feature.featuresIdParent._id,
                        )[0];
                    }
                    if (this.feature.divider === true) {
                        this.divider = 'true';
                    } else {
                        this.divider = 'false';
                    }
                    this.filteredListIcons = material;
                    this.listIcons = material;
                    this._loadingService.hide()
                },
                error: () => {
                    this._loadingService.hide()
                }
            });
        }
      }
    updateFeature(myForm: NgForm) {
        if (myForm.valid) {
          this.feature.divider = this.divider === 'true';
          if (this.feature.type === FeatureType.group) {
            this.feature.link = null;
          } else {
            this.feature.subtitle = null;
          }

                  this._featureService.updateFeature(this.feature).subscribe(() => {
                    this._router.navigate(['../'], { relativeTo: this._route }).then();
                  });
        }
      }
    cancelEdit(myForm: NgForm) {
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
    deleteFeature(feature) {
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
            this._featureService.deleteFeature(feature._id).subscribe(() => {
              this._router.navigate(['/home/features']).then();
            });
          }
        });
      }
}
