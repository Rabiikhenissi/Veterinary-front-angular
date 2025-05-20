import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Company } from 'app/shared/models/company';
import { AuthService } from 'app/shared/services/auth.service';
import { CompanyService } from 'app/shared/services/company.service';
import { UserService } from 'app/shared/services/user.service';


@Component({
    selector: 'landing-home',
    templateUrl: './home.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [MatButtonModule,CommonModule, MatIconModule,RouterLink,FormsModule]
})
export class LandingHomeComponent implements OnInit {
  _authService = inject(AuthService);
    _router = inject(Router);
    _route = inject(ActivatedRoute);
  companies: Company[] = [];
  defaultLogo = 'assets/images/logo/logo.svg';
  connectedUserId: string | null = null;
  connectedCompanyId: string | null = null;
addressMap: Map<string, string> = new Map();
veterinarians:any = [];
searchTerm: string = '';
filteredCompanies: Company[] = [];
filteredVeterinarians: any[] = [];
searchText: string = '';
minPrice: number | null = null;
maxPrice: number | null = null;
locationText: string = '';
  constructor(private _companyService: CompanyService,private _userService: UserService) {}

  ngOnInit(): void {
    
     this.connectedUserId = localStorage.getItem('connectedUserId');
    this.connectedCompanyId = localStorage.getItem('connectedUserCompany');
    console.log('connectedCompanyId', this.connectedCompanyId);
    console.log('connectedUserId', this.connectedUserId);    
    this.fetchCompanies();

    this.fetchVeterinarians();
  }

    details(company: Company) {
this._router.navigate([`/company-details/${company._id}`]);  }
  isConnectedCompany(companyId: string): boolean {
    return this.connectedCompanyId === companyId;
  }
    isConnected(): boolean {
    return !this.connectedUserId;
  }
getAddress(latitude: number, longitude: number): Promise<string> {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=pk.eyJ1IjoieW9zcmEtbmFqYXIiLCJhIjoiY2xmdGw2a20wMDF4eTNxcDBiMHZycnZpdCJ9.PTo1tyEyJry6uEKaqRLkRQ`;

  return fetch(url)
    .then(response => response.json())
    .then(data => {
      if (data.features && data.features.length > 0) {
        return data.features[0].place_name;
      } else {
        return 'Address not found';
      }
    })
    .catch(err => {
      console.error('Error fetching address:', err);
      return 'Address not available';
    });
}

getCompanyName(id: string): string {
  return this.companies.find(c => c._id === id)?.name || 'Unknown';
}

fetchCompanies() {
  this._companyService.getAll().subscribe({
      next: (res) => {
        this.companies = res.data;
        this.filteredCompanies = [...this.companies];
         // Fetch address for each company
      this.companies.forEach(company => {
        if (company.latitude && company.longitude) {
          this.getAddress(company.latitude, company.longitude).then(address => {
            this.addressMap.set(company._id!, address);
            this.applyFilters();
          })}})

          this.applyFilters();
      },
      error: (err) => {
        console.error('Failed to fetch companies ', err);
      },
    });
  }

  fetchVeterinarians() {
     this._userService.getVeterinarians().subscribe({
    next: (vets) => {
      this.veterinarians = vets.data.filter(vet => !vet?.archived);
      this.filteredVeterinarians = [...this.veterinarians];
    this.applyFilters();
      console.log('Veterinarians:', this.veterinarians);
    },
    error: (err) => {
      console.error('Error fetching veterinarians:', err);
    }
  });
}
applyFilters() {
  const search = this.searchText.toLowerCase();
  const location = this.locationText.toLowerCase();

  // Filter Companies
  this.filteredCompanies = this.companies.filter(company => {
    const nameMatch = company.name.toLowerCase().includes(search);
    const priceMatch =
      (!this.minPrice || company.visitPrice >= this.minPrice) &&
      (!this.maxPrice || company.visitPrice <= this.maxPrice);
    const address = this.addressMap.get(company._id!)?.toLowerCase() || '';
    const locationMatch = address.includes(location);

    return nameMatch && priceMatch && locationMatch;
  });

  // Filter Veterinarians
  this.filteredVeterinarians = this.veterinarians.filter(vet => {
    const nameMatch = vet.name?.toLowerCase().includes(search);
    const emailMatch = vet.email?.toLowerCase().includes(search);
    const companyMatch = vet.company?.name?.toLowerCase().includes(search);
    return nameMatch || emailMatch || companyMatch;
  });
}

}
