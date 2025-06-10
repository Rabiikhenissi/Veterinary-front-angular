import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { Router, ActivatedRoute } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoPipe } from '@ngneat/transloco';
import { Company } from 'app/shared/models/company';
import { MedicalServices } from 'app/shared/models/medicalServices';

import { AuthService } from 'app/shared/services/auth.service';
import { CompanyService } from 'app/shared/services/company.service';
import { LoadingService } from 'app/shared/services/loading.service';
import { MedicalServicesService } from 'app/shared/services/medicalServices.service';
import { PetSpeciesService } from 'app/shared/services/petSpecies.service';
import { UserService } from 'app/shared/services/user.service';
import mapboxgl from 'mapbox-gl';

@Component({
    selector: 'app-details',
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatDatepickerModule,
        CommonModule,
    ],
    templateUrl: './details.component.html',
    styleUrl: './details.component.scss',
})
export class DetailsComponent implements OnInit {
    _companyService = inject(CompanyService);
    _medicalServicesService = inject(MedicalServicesService);
    _authService = inject(AuthService);
    _userService = inject(UserService);
    _fuseConfirmationService = inject(FuseConfirmationService);
    _router = inject(Router);
    _route = inject(ActivatedRoute);
    _loadingService = inject(LoadingService);
    _petSpeciesService=inject(PetSpeciesService)
    id = this._route.snapshot.paramMap.get('id') || undefined;
petSpecies: any[] = [];
    company: Company = new Company();
    map: mapboxgl.Map | undefined;
    address: string | undefined;
    connectedUserId: string | null = null;
    connectedCompanyId: string | null = null;
    connectedUserType: string | null = null;
    services: MedicalServices[] = [];
daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    ngOnInit(): void {
        this.connectedUserId = localStorage.getItem('connectedUserId');
        this.connectedCompanyId = localStorage.getItem('connectedUserCompany');
        this.connectedUserType = localStorage.getItem('connectedUserType');
        console.log(this.connectedUserType);
        if (this.id) {
        
            this._loadingService.show();
            // Directly subscribe to the service without using forkJoin (only one request here)
            this._companyService.getOne(this.id).subscribe({
                next: (result: Company) => {
                    this.company = result;
                    console.log(this.company);
            this.fetchPetSpecies();
            this.fetchMedicalServices();
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
    fetchMedicalServices() {
  this._medicalServicesService.getAll(localStorage.getItem('connectedUserCompany') || '').subscribe({
    next: (res) => {
      this.services = res.data;
      console.log('Medical Services:', this.services);
    },
    error: (err) => {
      console.error('Failed to fetch medical services', err);
    }
  });
}


    initMapbox(): void {
        if (!this.company?.latitude || !this.company?.longitude) return;

        // Set your Mapbox token
        mapboxgl.accessToken =
            'pk.eyJ1IjoieW9zcmEtbmFqYXIiLCJhIjoiY2xmdGw2a20wMDF4eTNxcDBiMHZycnZpdCJ9.PTo1tyEyJry6uEKaqRLkRQ';

        // Initialize the Mapbox map
        this.map = new mapboxgl.Map({
            container: 'map', // HTML container id where the map will be rendered
            style: 'mapbox://styles/mapbox/streets-v12', // Map style
            center: [this.company.longitude, this.company.latitude], // Center the map on the company’s location
            zoom: 13, // Initial zoom level
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
                enableHighAccuracy: true, // Request high accuracy location
            },
            trackUserLocation: true, // Track the user's location on the map
            showUserLocation: true, // Display user's location on the map
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

    requestToGo() {
      this._router.navigate([`/join-vet/${this.company._id}`]);  }

    
    isConnected(): boolean {
        return !!this.connectedUserId;
    }
    switchVeterinary() {
         const confirmation = this._fuseConfirmationService.open({
        title: 'Switch Company',
        message: 'Are you sure you want to switch your company? You will be logged out and must wait for your account to be accepted by the new company.',
        actions: {
            confirm: {
                label: 'Yes, switch',
                color: 'primary',
            },
            cancel: {
                label: 'Cancel',
            },
        },
    });

        confirmation.afterClosed().subscribe((result) => {
            if (result === 'confirmed') {
                
                this._userService
                    .switchCompany(this.connectedUserId, this.company._id)
                    .subscribe({
                        next: () => {
                        // Optionally show a success notification
                        this._fuseConfirmationService.open({
                            icon: { name:"check_circle", color: "primary" },
                            title: 'Switched Successfully',
                            message: 'You have successfully switched company. You now have to wait for your account to be accepted.',
                            actions: {
                                confirm: {
                                    label: 'OK',
                                    color: 'primary',
                                },
                                cancel:{
                                    show:false
                                }
                            }
                        }).afterClosed().subscribe(() => {
                            
                             this._router.navigate(['/sign-in']);

                        });
                    },
                        error: (err) => {
                            console.error('Error switching company:', err);
                        },
                    });
                    this._authService.signOut();
            }
        });
    }

    goBack() {
  this._router.navigate(['/home']); // Adjust the route if your home path is different
}

fetchPetSpecies() {
    console.log('Fetching pet species...',this.company);
    this._petSpeciesService.getList(this.company._id).subscribe({
  next: (res) => {
    this.petSpecies = res.data; 
    console.log('Pet species:', this.petSpecies);
  },
  error: (err) => {
    console.error('Error fetching pet species:', err);
  }
});
this._loadingService.hide();
}
}
