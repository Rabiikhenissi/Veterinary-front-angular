import {Component, inject, OnInit} from '@angular/core';
import { NgForm, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Group } from '../../../../../shared/models/group';
import { fuseAnimations } from '../../../../../../@fuse/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseConfirmationService } from '../../../../../../@fuse/services/confirmation';
import { GroupService } from '../../../../../shared/services/group.service';
import { MatOption } from '@angular/material/core';
import { MatSelect, MatSelectTrigger} from '@angular/material/select';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import {MatButton, MatIconButton} from '@angular/material/button';
import {TranslocoPipe} from "@ngneat/transloco";
import {LoadingService} from "../../../../../shared/services/loading.service";
import {forkJoin} from "rxjs";
import {FeatureService} from "../../../../../shared/services/feature.service";
import {Feature} from "../../../../../shared/models/feature";
import {MatTooltip} from "@angular/material/tooltip";
import {MatSlideToggle} from "@angular/material/slide-toggle";
import {MatRadioButton} from "@angular/material/radio";
import {MatIcon} from "@angular/material/icon";
import {GroupFeature} from "../../../../../shared/models/group-feature";

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
        TranslocoPipe,
        MatTooltip,
        MatSlideToggle,
        MatRadioButton,
        MatIcon,
        MatIconButton,
    ],
})
export class AddComponent implements OnInit {
    //********* INJECT SERVICES ***********//
    _groupService= inject(GroupService);
    _featureService= inject(FeatureService);
    _router= inject(Router);
    _fuseConfirmationService= inject(FuseConfirmationService);
    _route= inject(ActivatedRoute);
    _loadingService = inject(LoadingService)
    //********* DECLARE CLASSES/ENUMS ***********//
    group = new Group();
    listFeature: Feature[]=[];
    featureId: Feature[] = [];
    filteredList = [];
    type: boolean[] = [true, true, true, true, true, true];
    groupFeature: GroupFeature[] = [new GroupFeature()];
    ngOnInit(): void {
    this._loadingService.show();
    forkJoin([
        this._featureService.getAllFeature()
    ]).subscribe({
        next:(result: [Feature[]]) => {
            this.listFeature = result[0];
            this._loadingService.hide();
        },
        error: () => {
            this._loadingService.hide();
        }
    })
  }
    createGroup(myForm: NgForm): void {
        if (myForm.valid) {
            if (!this.groupFeature[0].featuresId?._id) {
                console.log('Feature is required', 'error');
            } else {
                if (!this.groupFeature[this.groupFeature.length]) {
                    this.groupFeature.splice(this.groupFeature.length, 1);
                }
                if (this.groupFeature.filter((value) => value.defaultFeature).length === 0) {
                    console.log('Default feature is required', 'error');
                } else {
                    this._groupService.createOne(this.group, this.groupFeature).subscribe({
                        next:() => {
                            this._router.navigate([`../`], { relativeTo: this._route }).then();
                        }
                    });
                }
            }
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
                this.groupFeature.push(new GroupFeature());
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
                group.list = !this.type[0];
            }
            if (type === 'create') {
                group.create = !this.type[1];
            }
            if (type === 'read') {
                group.read = !this.type[2];
            }
            if (type === 'update') {
                group.update = !this.type[3];
            }
            if (type === 'delete') {
                group.delete = !this.type[4];
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
