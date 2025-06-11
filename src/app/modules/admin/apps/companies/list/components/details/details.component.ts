import {Component, inject, OnInit} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseConfirmationService } from '../../../../../../../../@fuse/services/confirmation';
import { Company } from '../../../../../../../shared/models/company';
import { CompanyService } from '../../../../../../../shared/services/company.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatError} from '@angular/material/select';
import { MatInput, MatInputModule } from '@angular/material/input';
import { MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatButton } from '@angular/material/button';
import {TranslocoPipe} from "@ngneat/transloco";
import {LoadingService} from "../../../../../../../shared/services/loading.service";
import {forkJoin} from "rxjs";
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import mapboxgl from 'mapbox-gl';
import { CommonModule } from '@angular/common';

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
        TranslocoPipe, MatDatepickerModule,CommonModule
    ],
    providers: [
            { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
            { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }, // Locale set to 'en-GB' for dd/mm/yyyy
            provideNativeDateAdapter(), // Ensure proper native date handling
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
    map: mapboxgl.Map | undefined;

    ngOnInit(): void {
        if (this.id) {
            this._loadingService.show()
            forkJoin([
                this._companyService.getOne(this.id),
            ]).subscribe({
                next: (result:[Company ]) => {
                    this.company = result[0];
                    if (this.company.firstCalendarDay) {
                        this.company.firstCalendarDay = this.formatDateForInput(this.company.firstCalendarDay);
                      }
                      
                      setTimeout(() => this.initMapbox(), 0);
                      
                },
                error: () => {
                    this._loadingService.hide()
                }
            });
        }
    }
    initMapbox(): void {
        if (!this.company?.latitude || !this.company?.longitude) return;
      
        (mapboxgl as any).accessToken = 'pk.eyJ1IjoieW9zcmEtbmFqYXIiLCJhIjoiY2xmdGw2a20wMDF4eTNxcDBiMHZycnZpdCJ9.PTo1tyEyJry6uEKaqRLkRQ';
        this.map = new mapboxgl.Map({
          container: 'map',
          style: 'mapbox://styles/mapbox/streets-v12',
          center: [this.company.longitude, this.company.latitude],
          zoom: 13,
        });
      
      this.map.on('load', () => {
        this._loadingService.hide(); // Hide loading when map is ready
    });
    this.map.addControl(new mapboxgl.NavigationControl());
    const marker = new mapboxgl.Marker()
        .setLngLat([this.company.longitude, this.company.latitude])
        .addTo(this.map);

    const nameElement = document.createElement('div');
    nameElement.className = 'company-name'; 
    nameElement.innerHTML = `<strong>${this.company.name}</strong>`;


    new mapboxgl.Marker(nameElement)
        .setLngLat([this.company.longitude, this.company.latitude])
        .setPopup(new mapboxgl.Popup({ offset: 25 }) ) 
        .addTo(this.map);

        
}
    formatDateForInput(date: string): string {
        const formattedDate = new Date(date);
        return formattedDate.toISOString().split('T')[0]; 
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
