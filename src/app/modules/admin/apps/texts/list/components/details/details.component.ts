import {Component, inject, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseConfirmationService } from '../../../../../../../../@fuse/services/confirmation';
import { Text } from '../../../../../../../shared/models/text';
import { TextService } from '../../../../../../../shared/services/text.service';
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
    _textService= inject(TextService);
    _router= inject(Router);
    _route= inject(ActivatedRoute);
    _fuseConfirmationService= inject(FuseConfirmationService);
    _loadingService= inject(LoadingService);
    //********* DECLARE CLASSES/ENUMS ***********//
    id = this._route.snapshot.paramMap.get('id') || undefined;
    text = new Text();
    ngOnInit(): void {
        if (this.id) {
            this._loadingService.show()
            forkJoin([
                this._textService.getOne(this.id),
            ]).subscribe({
                next: (result:[Text ]) => {
                    this.text = result[0];
                    this._loadingService.hide()
                },
                error: () => {
                    this._loadingService.hide()
                }
            });
        }
    }
    updateOne() {
        this._router.navigate([`/home/texts/${this.text._id}/edit`]).then();
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
                this._textService.deleteOne(this.text._id).subscribe(() => {});
                this._router.navigate(['/home/texts']).then();
            }
        });
    }
}
