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
  
    // Set your Mapbox token
    mapboxgl.accessToken = 'pk.eyJ1IjoieW9zcmEtbmFqYXIiLCJhIjoiY2xmdGw2a20wMDF4eTNxcDBiMHZycnZpdCJ9.PTo1tyEyJry6uEKaqRLkRQ';
  
    // Initialize the Mapbox map
    this.map = new mapboxgl.Map({
      container: 'map',                          // HTML container id where the map will be rendered
      style: 'mapbox://styles/mapbox/streets-v12',  // Map style
      center: [this.company.longitude, this.company.latitude],  // Center the map on the company’s location
      zoom: 13,  // Initial zoom level
    });
  
    // Add Navigation Control (zoom and rotation controls)
    this.map.addControl(new mapboxgl.NavigationControl());
  
    // Marker for company location
    const companyMarker = new mapboxgl.Marker()
      .setLngLat([this.company.longitude, this.company.latitude])
      .addTo(this.map);
  
    // Add a label for the company location
    const nameElement = document.createElement('div');
    nameElement.className = 'company-name';
    nameElement.innerHTML = `<strong>${this.company.name}</strong>`;
  
    new mapboxgl.Marker(nameElement)
      .setLngLat([this.company.longitude, this.company.latitude])
      .setPopup(new mapboxgl.Popup({ offset: 25 }))
      .addTo(this.map);
  
    // Function to get address for company location
    this.getAddress(this.company.latitude, this.company.longitude);
  
    // Add Geolocate Control to track user's location
    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,  // Request high accuracy location
      },
      trackUserLocation: true,    // Track the user's location on the map
      showUserLocation: true,     // Display user's location on the map
    });
  
    // Add the geolocate control to the map
    this.map.addControl(geolocate);
  
    // Wait for the map to load and then trigger geolocate control
    this.map.on('load', () => {
      // Trigger the geolocate control to fetch the user's location
      geolocate.trigger();
    });
  
    // Optional: You can listen to the geolocate event and get the user's position directly
    this.map.on('geolocate', (event: any) => {
      const userLat = event.coords.latitude;
      const userLng = event.coords.longitude;
  
      console.log('User location:', userLat, userLng);
  
      // Optionally, add a custom marker for the user's location
      new mapboxgl.Marker({ color: 'blue' })
        .setLngLat([userLng, userLat])
        .setPopup(new mapboxgl.Popup().setText('Your Location'))
        .addTo(this.map);
    });
    this.requestAndSetUserLocation();

  }
  requestAndSetUserLocation(): void {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser.');
      return;
    }
  
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
  
        console.log('User location:', latitude, longitude);
  
        // Add a custom marker for the user's location
        if (this.map) {
          new mapboxgl.Marker({ color: 'blue' })
            .setLngLat([longitude, latitude])
            .setPopup(new mapboxgl.Popup().setText('Your Location'))
            .addTo(this.map);
  
          // Optional: fly to user's location
          this.map.flyTo({
            center: [longitude, latitude],
            zoom: 14,
          });
        }
      },
      (error) => {
        console.error('Error getting user location:', error);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert('Location permission denied. Please allow it to use this feature.');
            break;
          case error.POSITION_UNAVAILABLE:
            alert('Location information is unavailable.');
            break;
          case error.TIMEOUT:
            alert('The request to get your location timed out.');
            break;
          default:
            alert('An unknown error occurred.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
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