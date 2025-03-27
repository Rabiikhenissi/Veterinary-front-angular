import {Component, inject, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseConfirmationService } from '../../../../../../../../@fuse/services/confirmation';
import { Feature } from '../../../../../../../shared/models/feature';
import { FeatureService } from '../../../../../../../shared/services/feature.service';
import { listFeatureStatus } from '../../../../../../../shared/enums/featureStatus';
import { listFeatureType, FeatureType } from '../../../../../../../shared/enums/featureType';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import {MatError, MatSelect, MatSelectTrigger} from '@angular/material/select';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import {TranslocoPipe} from "@ngneat/transloco";
import {LoadingService} from "../../../../../../../shared/services/loading.service";
import {forkJoin} from "rxjs";
@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  standalone: true,
    imports: [
        FormsModule,
        MatButton,
        MatIcon,
        MatFormField,
        MatLabel,
        MatInput,
        MatSelect,
        MatSelectTrigger,
        MatOption,
        ReactiveFormsModule,
        MatError,
        TranslocoPipe,
    ],
})
export class DetailsComponent implements OnInit {
    //********* INJECT SERVICES ***********//
    _featureService= inject(FeatureService);
    _router= inject(Router);
    _route= inject(ActivatedRoute);
    _fuseConfirmationService= inject(FuseConfirmationService);
    _loadingService= inject(LoadingService);
    //********* DECLARE CLASSES/ENUMS ***********//
    id = this._route.snapshot.paramMap.get('id') || undefined;
    feature = new Feature();
    readonly FeatureType = FeatureType;
    listFeatureStatus = listFeatureStatus;
    listFeatureType = listFeatureType;
    filteredListIcons = [];
    divider: string;

  ngOnInit(): void {
      if (this.id) {
          this._loadingService.show()
          forkJoin([
              this._featureService.getFeature(this.id),
          ]).subscribe({
              next: (result:[Feature ]) => {
                this.feature = result[0];
                this._loadingService.hide()
              },
              error: () => {
                  this._loadingService.hide()
              }
          });
      }
  }
  updateFeature() {
    this._router.navigate([`/home/features/${this.feature._id}/edit`]).then();
  }
  deleteFeature() {
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
        this._featureService.deleteFeature(this.feature._id).subscribe(() => {});
        this._router.navigate(['/home/features']).then();
      }
    });
  }
}
