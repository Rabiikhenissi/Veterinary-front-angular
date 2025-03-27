import {Component, inject, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseConfirmationService } from '../../../../../../../../@fuse/services/confirmation';
import { Company } from '../../../../../../../shared/models/company';
import { CompanyService } from '../../../../../../../shared/services/company.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatError} from '@angular/material/select';
import { MatInput } from '@angular/material/input';
import { MatFormField, MatLabel } from '@angular/material/form-field';
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
        MatFormField,
        MatLabel,
        MatInput,
        ReactiveFormsModule,
        MatError,
        TranslocoPipe,
    ],
})
export class DetailsComponent implements OnInit {
    //********* INJECT SERVICES ***********//
    _companyService= inject(CompanyService);
    _router= inject(Router);
    _route= inject(ActivatedRoute);
    _fuseConfirmationService= inject(FuseConfirmationService);
    _loadingService= inject(LoadingService);
    //********* DECLARE CLASSES/ENUMS ***********//
    id = this._route.snapshot.paramMap.get('id') || undefined;
    company = new Company();
    ngOnInit(): void {
        if (this.id) {
            this._loadingService.show()
            forkJoin([
                this._companyService.getOne(this.id),
            ]).subscribe({
                next: (result:[Company ]) => {
                    this.company = result[0];
                    this._loadingService.hide()
                },
                error: () => {
                    this._loadingService.hide()
                }
            });
        }
    }
    updateOne() {
        this._router.navigate([`/home/companies/${this.company._id}/edit`]).then();
    }
    deleteOne() {
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
                this._companyService.deleteOne(this.company._id).subscribe(() => {});
                this._router.navigate(['/home/companies']).then();
            }
        });
    }
}
