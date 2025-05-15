import { CurrencyPipe, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { Router, RouterLink } from '@angular/router';
import { TranslocoModule } from '@ngneat/transloco';
import { AppointmentService } from 'app/shared/services/appointment.service';
import { CartService } from 'app/shared/services/cart.service';
import { dashboardVetService } from 'app/shared/services/dashboard-vet.service';
import { ApexOptions, NgApexchartsModule } from 'ng-apexcharts';
import { Subject, takeUntil } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
@Component({
    selector       : 'dashboard-vet',
    templateUrl    : './dashboard.component.html',
    encapsulation  : ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports        : [MatSelectModule,MatFormFieldModule,FormsModule,MatPaginator,RouterLink,TranslocoModule, MatIconModule, MatButtonModule, MatRippleModule, MatMenuModule, MatTabsModule, MatButtonToggleModule, NgApexchartsModule, NgFor, NgIf, MatTableModule, CurrencyPipe,DatePipe],
})
export class DashboardComponent implements OnInit, OnDestroy
{
    @ViewChild(MatPaginator) paginator: MatPaginator;
currentSize = 10;
  currentPage = 1;
total = 0;
    chartGithubIssues: ApexOptions = {};
    chartTaskDistribution: ApexOptions = {};
    chartBudgetDistribution: ApexOptions = {};
    chartWeeklyExpenses: ApexOptions = {};
    chartMonthlyExpenses: ApexOptions = {};
    chartYearlyExpenses: ApexOptions = {};
    selectedProject: string = 'ACME Corp. Backend App';
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    companyId: string = '';
    chartMostSoldCategories: any;

    teamMembers: any[] = [];

    selectedMonth: string = this.getCurrentMonth(); // Default to the current month
  appointmentPerDayData: any = {}; // Stores the data for the chart
  chartAppointmentsPerDay: any = {}; // Initialize with an empty object to prevent 'undefined' error
  availableMonths: string[] = [];

    data:any = {
    }
  
displayedColumns: string[] = ['num', 'clientName', 'totalProd', 'totalMoney', 'date'];
cartList:any;


overviewStats: any = {
    clientsCount: 0,
    petsCount: 0,
    productsCount: 0,
    appointmentsLast7Days: 0}

    appointments: any[] = [];
    appointmentData = {
    total: 0,
    confirmed: 0,
    canceled: 0,
    pending: 0,
    completed: 0,
    recentAppointments: [],
  };
    /**
     * Constructor
     */
    constructor(
        private _dashboardVetService: dashboardVetService,
        private _router: Router,
        private _appointmentService: AppointmentService,
        private _cartService: CartService,
        private _cdr: ChangeDetectorRef,
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
      this.getCompanyTeam()
        this.generateMonthOptions();
this.getAppointmentsPerDay();



        this.companyId=localStorage.getItem('connectedUserCompany') || '';
        this._dashboardVetService.getAppointmentStats(this.companyId).subscribe({
            next: (data) =>
            {
                this.appointmentData = data;
            },
            error: () =>
            {
                // Redirect to the 404 page
                this._router.navigate(['/pages/errors/404']);
            }
        })

        // Get the overview stats
        this._dashboardVetService.getOverviewStats().subscribe({
            next: (data) =>
            {
                this.overviewStats = data;
                this._cdr.detectChanges();
                console.log('Overview stats:', this.overviewStats);
            },
            error: (err) =>
            {
                // see error
                console.log('Error fetching overview stats:', err);
            },
        })

        // Get the cart list
this.getCartList();

        


        this._appointmentService.getAllByCompany(this.companyId).subscribe({
            next: (data) =>
            {
                this.appointments = data;
            },
            error: () =>
            {
                // Redirect to the 404 page
                this._router.navigate(['/pages/errors/404']);
            },
        })

        this._dashboardVetService
    .getMostSoldCategories(this.companyId)
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe((result) => {
      // result is sorted desc by totalQuantity already
      const allCategories = ['Food', 'Hygiene', 'Accessories'];
const quantitiesMap = new Map(result.map(r => [r._id, r.totalQuantity]));

const categories = allCategories;
const quantities = allCategories.map(cat => quantitiesMap.get(cat) || 0);

      const maxQuantity = Math.max(...quantities);
      // Build radar chart config
      this.chartMostSoldCategories = {
        chart: {
          fontFamily: 'inherit',
          foreColor: 'inherit',
          height: '100%',
          type: 'radar',
          sparkline: { enabled: true },
        },
        colors: ['#34D399'],
        dataLabels: {
          enabled: true,
          formatter: (val: number) => `${val}`,
          textAnchor: 'start',
          style: { fontSize: '13px', fontWeight: 500 },
          background: { borderWidth: 0, padding: 4 },
          offsetY: -15,
        },
        markers: { strokeColors: '#34D399', strokeWidth: 4 },
        plotOptions: {
          radar: {
            polygons: {
              strokeColors: 'var(--fuse-border)',
              connectorColors: 'var(--fuse-border)',
            },
          },
        },
        series: [
          { name: 'Sold Quantity', data: quantities }
        ],
        stroke: { width: 2 },
        tooltip: {
          theme: 'dark',
          y: { formatter: (val: number) => `${val} sold` },
        },
        xaxis: {
          categories,
          labels: { show: true, style: { fontSize: '12px', fontWeight: '500' } },
        },
        yaxis: {
          max: Math.ceil(maxQuantity + 1),
          tickAmount: 5,
        },
      };

    })



        this._dashboardVetService.getPetCountBySpecies().subscribe({
          next: (result) => {
            const labels = result.map((item: any) => item._id);
            const series = result.map((item: any) => item.count);
        
            this.chartTaskDistribution = {
              chart: {
                fontFamily: 'inherit',
                foreColor: 'inherit',
                height: '100%',
                type: 'polarArea',
                toolbar: { show: false },
                zoom: { enabled: false },
              },
              labels: labels,
              legend: { position: 'bottom' },
              plotOptions: {
                polarArea: {
                  spokes: { connectorColors: 'var(--fuse-border)' },
                  rings: { strokeColor: 'var(--fuse-border)' },
                },
              },
              series: series,
              states: {
                hover: {
                  filter: {
                    type: 'darken',
                    value: 0.75,
                  },
                },
              },
              stroke: { width: 2 },
              theme: {
                monochrome: {
                  enabled: true,
                  color: '#34D399',
                  shadeIntensity: 0.75,
                  shadeTo: 'dark',
                },
              },
              tooltip: {
                followCursor: true,
                theme: 'dark',
              },
              yaxis: {
                min: 0,
                max: Math.max(...series, 1), // use fallback to avoid NaN
                tickAmount: Math.max(...series, 1),
                labels: {
                  style: {
                    colors: 'var(--fuse-text-secondary)',
                    fontSize: '14px',
                    fontWeight: 600,
                  },
                },
              },
            };
        
            // ✅ This must be inside the 'next' block
            if (result.length > 0) {
              const top = result[0];
              console.log(`Top category: ${top._id} (${top.count} pets)`);
            }
          },
          error: (err) => {
            console.error('Failed to fetch pet count by species:', err);
          },
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

    /**
     * Fix the SVG fill references. This fix must be applied to all ApexCharts
     * charts in order to fix 'black color on gradient fills on certain browsers'
     * issue caused by the '<base>' tag.
     *
     * Fix based on https://gist.github.com/Kamshak/c84cdc175209d1a30f711abd6a81d472
     *
     * @param element
     * @private
     */
    private _fixSvgFill(element: Element): void
    {
        // Current URL
        const currentURL = this._router.url;

        // 1. Find all elements with 'fill' attribute within the element
        // 2. Filter out the ones that doesn't have cross reference so we only left with the ones that use the 'url(#id)' syntax
        // 3. Insert the 'currentURL' at the front of the 'fill' attribute value
        Array.from(element.querySelectorAll('*[fill]'))
            .filter(el => el.getAttribute('fill').indexOf('url(') !== -1)
            .forEach((el) =>
            {
                const attrVal = el.getAttribute('fill');
                el.setAttribute('fill', `url(${currentURL}${attrVal.slice(attrVal.indexOf('#'))}`);
            });
    }
 getCartList(): void {
    this._cartService.getList(this.currentPage,
         this.currentSize,
          this.companyId
        
        ).subscribe({
            next: (res) =>
            {
                this.cartList = res.data;
                console.log('Cart list:', this.cartList);
                this.total = res.total; // total number of items for pagination
            },
            error: () =>
            {
                // Redirect to the 404 page
                this._router.navigate(['/pages/errors/404']);
            },
        })
    }

    getCurrentMonth(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Adding leading zero if needed
    return `${year}-${month}`;
  }
  generateMonthOptions(): void {
    const months: string[] = [];
  const today = new Date();

  for (let i = 0; i < 12; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    months.push(this.formatMonth(date));
  }

  this.availableMonths = months;
}

formatMonth(date: Date): string {
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
}

getCompanyTeam(): void {
  this._dashboardVetService.getCompanyTeam().subscribe({
    next: (members) => {
      this.teamMembers = members;
      console.log('Team members:', this.teamMembers);
    },
    error: (err) => {
      console.error('Failed to fetch team:', err);
    }
  });
}
    pageChanged(event: PageEvent ): void {
          let { pageIndex } = event;
          const { pageSize } = event;
          pageIndex++;
          if (pageSize !== this.currentSize) {
            pageIndex = 1;
            this.paginator.firstPage();
          }
          this.currentSize = pageSize;
          this.currentPage = pageIndex;
          this.getCartList();
        }

        

        getAppointmentsPerDay(): void {
    this._dashboardVetService.getAppointmentsPerDay(this.selectedMonth).subscribe({
  next: (data) => {
    this.appointmentPerDayData = data;

    this.chartAppointmentsPerDay = {
      chart: {
        fontFamily: 'inherit',
        foreColor: 'inherit',
        height: '100%',
        type: 'bar',
        toolbar: { show: false },
        zoom: { enabled: false },
      },
      colors: ['#22c55e'],
      dataLabels: {
        enabled: true,
        enabledOnSeries: [0],
        background: { borderWidth: 0 },
      },
      grid: {
        borderColor: 'var(--fuse-border)',
      },
      labels: this.appointmentPerDayData.labels,
      legend: { show: false },
      plotOptions: {
        bar: { columnWidth: '50%' },
      },
      series: [
        {
          name: 'Appointments',
          data: this.appointmentPerDayData.series,
        },
      ],
      states: {
        hover: {
          filter: {
            type: 'darken',
            value: 0.75,
          },
        },
      },
      stroke: { width: [3, 0] },
      tooltip: {
        followCursor: true,
        theme: 'dark',
      },
      xaxis: {
        categories: this.appointmentPerDayData.labels,
        axisBorder: { show: false },
        axisTicks: { color: 'var(--fuse-border)' },
        labels: { style: { colors: 'var(--fuse-text-secondary)' } },
        tooltip: { enabled: false },
      },
      yaxis: {
        labels: {
          offsetX: -16,
          style: { colors: 'var(--fuse-text-secondary)' },
        },
      },
    };
    
  },

  error: (err) => {
    console.error('Error fetching data:', err);
  }
});

  }


     

onMonthChange(selectedMonth: string): void {
    this.selectedMonth = selectedMonth;
    console.log('Selected month:', this.selectedMonth);
    
    this.getAppointmentsPerDay(); // Re-fetch the data for the selected month
    
  }

        

    /**
     * Prepare the chart data from the data
     *
     * @private
     */
    
}
