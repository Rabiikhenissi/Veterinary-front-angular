import {ChangeDetectionStrategy, Component, inject, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseConfirmationService } from '../../../../../../../../@fuse/services/confirmation';
import { Company } from '../../../../../../../shared/models/company';
import { CompanyService } from '../../../../../../../shared/services/company.service';
import { NgForm, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInput, MatInputModule } from '@angular/material/input';
import { MatFormField, MatLabel, MatError, MatFormFieldModule } from '@angular/material/form-field';
import { MatButton } from '@angular/material/button';
import {TranslocoModule} from "@ngneat/transloco";
import {forkJoin} from "rxjs";
import {LoadingService} from "../../../../../../../shared/services/loading.service";
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY', // Parsing format for input
  },
  display: {
    dateInput: 'DD/MM/YYYY', // Display format for input
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};
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
            MatFormFieldModule, MatInputModule, MatDatepickerModule
    
  ], providers: [
        { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
        { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }, // Locale set to 'en-GB' for dd/mm/yyyy
        provideNativeDateAdapter(), // Ensure proper native date handling
      ],
})
export class EditComponent implements OnInit {
    //********* INJECT SERVICES ***********//
    _companyService= inject(CompanyService);
    _router= inject(Router);
    _route= inject(ActivatedRoute);
    _fuseConfirmationService= inject(FuseConfirmationService);
    _loadingService= inject(LoadingService);
    //********* DECLARE CLASSES/ENUMS ***********//
    id = this._route.snapshot.paramMap.get('id') || undefined;
    company: Company;
    ngOnInit(): void {
        if (this.id) {
            this._loadingService.show()
            forkJoin([
                this._companyService.getOne(this.id),
            ]).subscribe({
                next: (result:[Company]) => {
                    this.company = result[0];
                    if (this.company.firstCalendarDay) {
                      this.company.firstCalendarDay = this.formatDateForInput(this.company.firstCalendarDay);
                    }
                    this._loadingService.hide()
                },
                error: () => {
                    this._loadingService.hide()
                }
            });
        }
      }
      formatDateForInput(date: string): string {
        const formattedDate = new Date(date);
        return formattedDate.toISOString().split('T')[0]; // returns 'YYYY-MM-DD'
      }
    updateOne(myForm: NgForm) {
        if (myForm.valid) {
          this.company.firstCalendarDay = this.addOneDay(this.company.firstCalendarDay);
            this._companyService.updateOne(this.company).subscribe(() => {
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
    deleteOne(row: Company) {
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
            this._companyService.deleteOne(row._id).subscribe(() => {
                this._router.navigate([`../`], { relativeTo: this._route }).then();
            });
          }
        });
      }
      addOneDay(date: string): string {
        const newDate = new Date(date);
        newDate.setDate(newDate.getDate() + 1); 
        return newDate.toISOString().split('T')[0]; 
      }
}
