import {NgFor } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import { User } from 'app/shared/models/user';
import { AppointmentService } from 'app/shared/services/appointment.service';
import { AuthService } from 'app/shared/services/auth.service';
import { dashboardAdminService } from 'app/shared/services/dashboard-admin.service';
import { UserService } from 'app/shared/services/user.service';
import { ApexChart, ApexNonAxisChartSeries, ApexOptions, ApexResponsive, NgApexchartsModule } from 'ng-apexcharts';
import { Subject } from 'rxjs';

export type ChartOptions = {
    series: ApexNonAxisChartSeries;
    chart: ApexChart;
    labels: string[];
    responsive: ApexResponsive[];
  };

@Component({
    selector       : 'dashboard-admin',
    templateUrl    : './dashboard.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports        : [TranslocoModule, MatIconModule, MatButtonModule, MatRippleModule, MatMenuModule, MatTabsModule, MatButtonToggleModule, NgApexchartsModule, NgFor, MatTableModule,NgApexchartsModule],
})
export class DashboardComponent implements OnInit, OnDestroy
{
  _userService=inject(UserService);
  _authService=inject(AuthService)
  veterinarians:User[] = [];
admin: User;
    chartAppointmentStats: any = {
        chart: {
          type: 'bar',
          height: 350,
        },
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '55%',
          },
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          show: true,
          width: 2,
          colors: ['transparent'],
        },
        xaxis: {
          categories: [], // This will hold the names of the companies
        },
        yaxis: {
          title: {
            text: 'Appointments',
          },
        },
        fill: {
          opacity: 1,
        },
        tooltip: {
          y: {
            formatter: (val) => `${val} appointments`,
          },
        },
        colors: ['#00b894', '#0984e3'], // Colors for completed and confirmed
        series: [], // Data for confirmed and completed appointments
      };
    chartTopCompanies  : ApexOptions = {};
    data: any;
    selectedProject: string = 'ACME Corp. Backend App';
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    companiesCount = { total: 0, inactive: 0 };
veterinariansCount = { total: 0, inactive: 0 };
secretariesCount = { total: 0, inactive: 0 };
featuresCount = { total: 0, inactive: 0 };

stats = {
    total: 0,
    confirmed: 0,
    canceled: 0,
    pending: 0,
    completed: 0,
    rescheduled: 0,
  };

    /**
     * Constructor
     */
    constructor(
        private _projectService: dashboardAdminService,
        private _router: Router,
        private _appointmentService: AppointmentService,
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
      this._userService.getOne(localStorage.getItem('connectedUserId')).subscribe({
        next: (user: User) => {
          this.admin = user;
        },
        error: (err) => console.error('Error fetching admin user:', err),
      });
      console.log('Connected User:', localStorage.getItem('connectedUserId'));
      this.fetchVeterinarians();
        this.fetchAppointmentStats();
this.loadDashboardCounts();
        this.fetchAllAppointments();

          this._appointmentService.getTopCompaniesComparison().subscribe({
            next: (data) => {
              // Prepare the chart data for series
              this.chartTopCompanies.series = [
                {
                  name: 'Completed This Week',
                  data: data.map(c => c.completedThisWeek),
                },
                {
                  name: 'Confirmed This Week',
                  data: data.map(c => c.confirmedThisWeek),
                },
                {
                  name: 'Completed Last Week',
                  data: data.map(c => c.completedLastWeek),
                },
                {
                  name: 'Confirmed Last Week',
                  data: data.map(c => c.confirmedLastWeek),
                },
              ];
          
              // Set x-axis labels as the company names
              this.chartTopCompanies.xaxis = {
                categories: data.map(c => c.name),
              };
            },
            error: (err) => console.error('Error fetching top companies comparison:', err),
          });
          

        // get mock api data
        this._projectService.getData().subscribe((data) => {
            this.data = data;
            this._prepareChartData();
        });
    }
    

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any
    {
        return item.id || index;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    fetchAllAppointments(): void {
        this._appointmentService.getAll().subscribe({
            next: (data) => {
                this.stats = data
            },
            error: (err) => console.error('Error fetching appointment stats:', err),
          });
    }
fetchVeterinarians(): void {
  this._userService.getInternalUsers().subscribe({
    next: (internalUsersResponse: any) => {
      const internalUsers = internalUsersResponse?.data;
      if (Array.isArray(internalUsers)) {
        this.veterinarians = internalUsers.filter((user) => 
          user.groupsId && user.groupsId.code.includes('veterinarian') 
        );

        console.log('Veterinarians:', this.veterinarians);
        
      } 
    },
    error: (err) => console.error('Error fetching veterinarians:', err),
  });
}


loadDashboardCounts(): void {
    this._projectService.getStats().subscribe((data) => {
      this.companiesCount.total = data.companies.total;
        this.companiesCount.inactive = data.companies.inactive;
        
      this.veterinariansCount.total = data.veterinarians.total;
        this.veterinariansCount.inactive = data.veterinarians.inactive;
      this.secretariesCount.total = data.secretaries.total;
        this.secretariesCount.inactive = data.secretaries.inactive;
      this.featuresCount.total = data.features.total;
        this.featuresCount.inactive = data.features.inactive;
    });
  }
  fetchAppointmentStats() {
  this._appointmentService.getTopCompaniesComparison().subscribe({
    next: (data) => {
      // Prepare the chart data for series
      this.chartAppointmentStats.series = [
        {
          name: 'Completed (This Week)',
          data: data.map((company) => company.completedThisWeek),
        },
        {
          name: 'Confirmed (This Week)',
          data: data.map((company) => company.confirmedThisWeek),
        },
        {
          name: 'Completed (Last Week)',
          data: data.map((company) => company.completedLastWeek),
        },
        {
          name: 'Confirmed (Last Week)',
          data: data.map((company) => company.confirmedLastWeek),
        },
      ];

      // Set x-axis categories as the company names
      this.chartAppointmentStats.xaxis.categories = data.map((company) => company.name);
    },
    error: (err) => console.error('Error fetching appointment stats:', err),
  });
}



    /**
     * Prepare the chart data from the data
     *
     * @private
     */
    private _prepareChartData(): void
    {
        // appointment issues
        this._appointmentService.getTopCompaniesComparison().subscribe((data) => {
  const categories = data.map(d => d.companyName);

  const confirmedThisWeek = data.map(d =>
    d.stats.find(s => s.week === 'this-week' && s.status === 'confirmed')?.count || 0
  );
  const completedThisWeek = data.map(d =>
    d.stats.find(s => s.week === 'this-week' && s.status === 'completed')?.count || 0
  );

  const confirmedLastWeek = data.map(d =>
    d.stats.find(s => s.week === 'last-week' && s.status === 'confirmed')?.count || 0
  );
  const completedLastWeek = data.map(d =>
    d.stats.find(s => s.week === 'last-week' && s.status === 'completed')?.count || 0
  );

  this.chartAppointmentStats = {
  chart: {
    type: 'bar',
    height: 350,
    stacked: false,
    toolbar: { show: false },
    zoom: { enabled: false }
  },
  colors: ['#3b82f6', '#10b981', '#60a5fa', '#6ee7b7'],
  dataLabels: {
    enabled: false
  },
  stroke: {
    width: [0, 0, 2, 2], // bar=0, line=2
    curve: 'smooth'
  },
  plotOptions: {
    bar: {
      columnWidth: '40%',
      borderRadius: 6,
      dataLabels: {
        position: 'top',
      }
    }
  },
  xaxis: {
    categories: categories || [], // Make sure categories is not undefined
    labels: {
      style: { fontSize: '13px' }
    }
  },
  yaxis: {
  labels: {
    style: {
      fontSize: '12px'
    },
    formatter: function (val) {
      return Math.round(val); // or: return val.toFixed(0);
    }
  
  }
},
  tooltip: {
  shared: true,
  intersect: false,
  theme: 'light',
  y: {
    formatter: function (val) {
      return `${Math.round(val)} appointments`;
    }
  }
}
,
  legend: {
    position: 'top',
    fontSize: '13px',
    fontWeight: 500,
    markers: {
      radius: 4
    }
  },
  series: [
    {
      name: 'Confirmed (This Week)',
      type: 'column',
      data: confirmedThisWeek || [],
    },
    {
      name: 'Confirmed (Last Week)',
      type: 'column',
      data: confirmedLastWeek || [],
    },
    {
      name: 'Completed (This Week)',
      type: 'line',
      data: completedThisWeek || [],
    },
    {
      name: 'Completed (Last Week)',
      type: 'line',
      data: completedLastWeek || [],
    },
  ]
};


});
        

        
    }
}
