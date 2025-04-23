import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, inject} from '@angular/core';
import { NgForm, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Company } from '../../../../../shared/models/company';
import { fuseAnimations } from '../../../../../../@fuse/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseConfirmationService } from '../../../../../../@fuse/services/confirmation';
import { CompanyService } from '../../../../../shared/services/company.service';
import { MatInput, MatInputModule } from '@angular/material/input';
import { MatFormField, MatLabel, MatError, MatFormFieldModule } from '@angular/material/form-field';
import { MatButton } from '@angular/material/button';
import {TranslocoPipe} from "@ngneat/transloco";
import {LoadingService} from "../../../../../shared/services/loading.service";
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import mapboxgl from 'mapbox-gl';
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
        ReactiveFormsModule,
        TranslocoPipe,
        MatFormFieldModule, MatInputModule, MatDatepickerModule
        
    ],
    providers: [
      { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
      { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }, // Locale set to 'en-GB' for dd/mm/yyyy
      provideNativeDateAdapter(), // Ensure proper native date handling
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddComponent implements AfterViewInit {
    //********* INJECT SERVICES ***********//
    _changeDetectorRef = inject(ChangeDetectorRef);
    _companyService= inject(CompanyService);
    _router= inject(Router);
    _fuseConfirmationService= inject(FuseConfirmationService);
    _route= inject(ActivatedRoute);
    _loadingService = inject(LoadingService)
    //********* DECLARE CLASSES/ENUMS ***********//
    company = new Company();
    map!: mapboxgl.Map;
    marker?: mapboxgl.Marker;


    ngAfterViewInit(): void {
      // set the token
      (mapboxgl as any).accessToken = 'pk.eyJ1IjoieW9zcmEtbmFqYXIiLCJhIjoiY2xmdGw2a20wMDF4eTNxcDBiMHZycnZpdCJ9.PTo1tyEyJry6uEKaqRLkRQ';
  
      // init the map
      this.map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [10.1658, 36.8065],
                zoom: 9
      });
  
      // handle map click
      this.map.on('click', (event) => {
        const { lng, lat } = event.lngLat;
        this._changeDetectorRef.detectChanges();
        // drop or move marker
        if (!this.marker) {
          this.marker = new mapboxgl.Marker({ draggable: true })
            .setLngLat([lng, lat])
            .addTo(this.map);
  
          this.marker.on('draged', () => {
            const pos = this.marker!.getLngLat();
            this.company.latitude = pos.lat;
            this.company.longitude = pos.lng;
            this._changeDetectorRef.detectChanges();
          });
        } else {
          this.marker.setLngLat([lng, lat]);
        }
  
        // set the lat/lng in model
        this.company.latitude = lat;
        this.company.longitude = lng;
      });
    }
  




  addOne(myForm: NgForm): void {
    if (myForm.valid) {
      this.company.firstCalendarDay = this.addOneDay(this.company.firstCalendarDay);
        this._companyService.createOne(this.company).subscribe(() => {
            this._router.navigate([`../`], { relativeTo: this._route }).then();
        })
    }
  }
  addOneDay(date: string): string {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + 1); 
    return newDate.toISOString().split('T')[0]; 
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
