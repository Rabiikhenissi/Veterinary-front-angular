import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTab, MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Company } from 'app/shared/models/company';
import { MedicalServices } from 'app/shared/models/medicalServices';
import { AuthService } from 'app/shared/services/auth.service';
import { CompanyService } from 'app/shared/services/company.service';
import { GroupService } from 'app/shared/services/group.service';
import { MedicalServicesService } from 'app/shared/services/medicalServices.service';
import { UserService } from 'app/shared/services/user.service';


@Component({
    selector: 'landing-home',
    templateUrl: './home.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [MatButtonModule,CommonModule, MatIconModule,RouterLink,FormsModule,MatTab,MatTabsModule]
})
export class LandingHomeComponent implements OnInit {
  _authService = inject(AuthService);
    _router = inject(Router);
    _route = inject(ActivatedRoute);
  _companyService = inject(CompanyService);
  _medicalServicesService = inject(MedicalServicesService);
  _userService = inject(UserService);
  _groupService = inject(GroupService);
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
showFilters = false;
companyServicesMap: Map<string, MedicalServices[]> = new Map();

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

        this.companies.forEach(company => {
          if (company._id) {
            this.fetchMedicalServices(company._id);
          }
          console.log(`Company details:`, company);
          
          

          // Get address
          if (company.latitude && company.longitude) {
            this.getAddress(company.latitude, company.longitude).then(address => {
              this.addressMap.set(company._id!, address);
            });
          }
        });

        this.applyFilters();
      },
      error: (err) => {
        console.error('Failed to fetch companies', err);
      },
    });
  }

  fetchMedicalServices(companyId: string) {
    this._medicalServicesService.getAll(companyId).subscribe({
      next: (res) => {
        this.companyServicesMap.set(companyId, res.data);
        console.log(`Medical services for company ${companyId}:`, this.companyServicesMap);
      },
      error: (err) => {
        console.error(`Failed to fetch medical services for company ${companyId}`, err);
      }
    });
  }
getCompany(id: string) {
  return this._companyService.getOne(id).subscribe({
    next: (res) => {
      console.log('Company details:', res);
      return res.name
    },
    error: (err) => {
      console.error('Failed to fetch company details', err);
      return undefined;
    }
  });
}
fetchVeterinarians() {
  console.log('Fetching veterinarians...');
  
  this._userService.getVeterinarians().subscribe({
    next: (vets) => {
      console.log('Raw veterinarians data:', vets);

      this.veterinarians = vets.data.filter(vet => !vet?.archived);
      console.log('Non-archived veterinarians:', this.veterinarians);

      const filteredVets: any[] = [];

      this.veterinarians.forEach(vet => {
        console.log(`Fetching group for vet ID ${vet._id}, groupId: ${vet.groupsId._id}`);
        
        this._groupService.getOne(vet.groupsId._id).subscribe({
          next: (group) => {
            console.log(`Group fetched for vet ID ${vet._id}:`, group);
            
            if (group.code && group.code.toLowerCase().includes('veterinarian')) {
              console.log(`Vet ID ${vet._id} added to filtered list`);
              filteredVets.push(vet);
                this.filteredVeterinarians = [...filteredVets];
              console.log('Current filteredVeterinarians:', this.filteredVeterinarians);
            } 
          },
          error: (err) => {
            console.error(`Error fetching group for vet ID ${vet._id}:`, err);
          }
        });
      });
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
