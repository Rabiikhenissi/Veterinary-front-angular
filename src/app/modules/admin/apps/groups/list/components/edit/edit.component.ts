import {Component, inject, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseConfirmationService } from '../../../../../../../../@fuse/services/confirmation';
import { Group } from '../../../../../../../shared/models/group';
import { GroupService } from '../../../../../../../shared/services/group.service';
import { NgForm, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatButton } from '@angular/material/button';
import {TranslocoModule} from "@ngneat/transloco";
import {forkJoin} from "rxjs";
import {LoadingService} from "../../../../../../../shared/services/loading.service";
import {G} from "@angular/cdk/keycodes";
import {MatOption} from "@angular/material/autocomplete";
import {MatRadioButton} from "@angular/material/radio";
import {MatSelect, MatSelectTrigger} from "@angular/material/select";
import {MatSlideToggle} from "@angular/material/slide-toggle";
import {GroupFeature} from "../../../../../../../shared/models/group-feature";
import {Feature} from "../../../../../../../shared/models/feature";
import {FeatureService} from "../../../../../../../shared/services/feature.service";
import {MatTooltip} from "@angular/material/tooltip";
@Component({
    selector: 'app-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.scss'],
    imports: [
        FormsModule,
        MatButton,
        MatFormField,
        MatLabel,
        MatInput,
        MatError,
        ReactiveFormsModule,
        TranslocoModule,
        MatOption,
        MatRadioButton,
        MatSelect,
        MatSelectTrigger,
        MatSlideToggle,
        MatTooltip,
    ],
})
export class EditComponent implements OnInit {
    //********* INJECT SERVICES ***********//
    _groupService= inject(GroupService);
    _featureService= inject(FeatureService);
    _router= inject(Router);
    _route= inject(ActivatedRoute);
    _fuseConfirmationService= inject(FuseConfirmationService);
    _loadingService= inject(LoadingService);
    //********* DECLARE CLASSES/ENUMS ***********//
    id = this._route.snapshot.paramMap.get('id') || undefined;
    group: Group;
    filteredList = [];
    groupFeature: GroupFeature[];
    testGroup: GroupFeature[];
    featureId: Feature[] = [];
    listFeature: Feature[] = [];
    featureWithId: string[] = [];
    type: boolean[] = [true, true, true, true, true, true];
    index: number;
    ngOnInit(): void {
        if (this.id) {
            this._loadingService.show()
            forkJoin([
                this._groupService.getOne(this.id),
                this._groupService.getFeatureGroup(this.id),
                this._featureService.getAllFeature(),
            ]).subscribe({
                next: (result:[Group, GroupFeature[], Feature[] ]) => {
                    this.group = result[0];
                    this.groupFeature = result[1];
                    this.listFeature = result[2];
                    this.filteredList.push(this.listFeature);
                    this.filteredList = this.listFeature.map(() => this.listFeature);
                    this.featureId = this.groupFeature.map((value) => value.featuresId);
                    this.testGroup = this.groupFeature;
                    this.filteredList = this.listFeature.map(() => this.listFeature);
                    this.featureId = this.groupFeature.map((value) => value.featuresId);
                    this.featureWithId = this.featureId.map((site) => site._id);
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    if (this.groupFeature.length !== this.listFeature.length) {
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
                    this._loadingService.hide()
                },
                error: () => {
                    this._loadingService.hide()
                }
            });
        }
    }
    updateOne(myForm: NgForm) {
        if (myForm.valid) {
            this._groupService.updateOne(this.group, this.groupFeature).subscribe(() => {
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
    deleteOne(row: Group) {
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
                this._groupService.deleteOne(row._id).subscribe(() => {
                    this._router.navigate([`../`], { relativeTo: this._route }).then();
                });
            }
        });
    }
    grantAll(event) {
        event.stopPropagation();
        this.filteredList = this.listFeature.map(() => this.listFeature);
        //this.featureId = this.listFeature.map((value) => value);
        let i = 0;
        for (const group of this.groupFeature) {
            if (group.featuresId === null) {
                this.groupFeature.splice(i, 1);
            }
            i++;
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for (const feature of this.listFeature) {
            if (!this.featureId.map((value) => value._id).includes(feature._id) && feature._id) {
                this.featureId.push(feature);
                this.groupFeature.push({
                    featuresId: feature,
                    list: true,
                    create: true,
                    update: true,
                    read: true,
                    delete: true,
                    status: true,
                    defaultFeature: false,
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
        this.type = [true, true, true, true, true, true];
        this.featureWithId = [];
    }
    deleteRow(index) {
        this.featureId.splice(index, 1);
        this.groupFeature[index] = this.groupFeature[index + 1];
        this.groupFeature.splice(index, 1);
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
        this.featureWithId.splice(index, 1);
    }
    addRow(index, value): void {
        if (value !== null) {
            this.featureId[index] = this.listFeature.filter((val) => val._id === value)[0];
            this.featureWithId[index] = value;
            this.groupFeature[index].featuresId = this.listFeature.filter((val) => val._id === value)[0];
            this.filteredList.push(this.listFeature);
            if (
                this.groupFeature[index] &&
                this.groupFeature.length - 1 === index &&
                this.groupFeature.length !== this.listFeature.length
            ) {
                this.groupFeature.push({
                    featuresId: null,
                    list: true,
                    create: true,
                    read: true,
                    update: true,
                    delete: true,
                    status: true,
                    defaultFeature: false,
                });
            }
        } else {
            this.deleteRow(index);
        }
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
