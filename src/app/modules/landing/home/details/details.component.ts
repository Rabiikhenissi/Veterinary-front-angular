import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslocoPipe } from '@ngneat/transloco';
import { Company } from 'app/shared/models/company';
import { CompanyService } from 'app/shared/services/company.service';
import { LoadingService } from 'app/shared/services/loading.service';
import mapboxgl from 'mapbox-gl';

@Component({
  selector: 'app-details',
   imports: [
          FormsModule,
          ReactiveFormsModule,
          TranslocoPipe, MatDatepickerModule,CommonModule
      ],
  templateUrl: './details.component.html',
  styleUrl: './details.component.scss'
})
export class DetailsComponent implements OnInit {
  _companyService = inject(CompanyService);
  _router = inject(Router);
  _route = inject(ActivatedRoute);
  _loadingService = inject(LoadingService);
  id = this._route.snapshot.paramMap.get('id') || undefined;

  company: Company = new Company();
  map: mapboxgl.Map | undefined;
  address: string | undefined;



  ngOnInit(): void {
    
    if (this.id) {
      this._loadingService.show();

      // Directly subscribe to the service without using forkJoin (only one request here)
      this._companyService.getOne(this.id).subscribe({
        next: (result: Company) => {
          this.company = result;
          console.log(this.company);
          
          if (this.company.firstCalendarDay) {
            this.company.firstCalendarDay = this.formatDateForInput(
              this.company.firstCalendarDay
            );
          }
          this._loadingService.hide();

          // Initialize Mapbox after the data is loaded
          this.initMapbox();
        },
        error: () => {
          this._loadingService.hide();
          console.error('Error loading company details');
        },
      });
    }
  }

 initMapbox(): void {
    if (!this.company?.latitude || !this.company?.longitude) return;

    // Mapbox access token should be placed in environment variables or config file
    (mapboxgl as any).accessToken =
      'pk.eyJ1IjoieW9zcmEtbmFqYXIiLCJhIjoiY2xmdGw2a20wMDF4eTNxcDBiMHZycnZpdCJ9.PTo1tyEyJry6uEKaqRLkRQ'; // Replace with your token securely

    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [this.company.longitude, this.company.latitude],
      zoom: 13,
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
      .setPopup(new mapboxgl.Popup({ offset: 25 }))
      .addTo(this.map);

    // Call reverse geocoding to extract the address
    this.getAddress(this.company.latitude, this.company.longitude);
  }

  getAddress(latitude: number, longitude: number): void {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=pk.eyJ1IjoieW9zcmEtbmFqYXIiLCJhIjoiY2xmdGw2a20wMDF4eTNxcDBiMHZycnZpdCJ9.PTo1tyEyJry6uEKaqRLkRQ`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data.features && data.features.length > 0) {
          this.address = data.features[0].place_name; // Extract address
        }
      })
      .catch((err) => {
        console.error('Error fetching address:', err);
      });
  }

  formatDateForInput(date: string): string {
    const formattedDate = new Date(date);
    return formattedDate.toISOString().split('T')[0];
  }
}