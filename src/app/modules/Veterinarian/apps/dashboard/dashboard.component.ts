import { CurrencyPipe, DatePipe, NgClass, NgFor, NgIf } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    inject,
    OnDestroy,
    OnInit,
    signal,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
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
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { User } from 'app/shared/models/user';
import { UserService } from 'app/shared/services/user.service';
import { CompanyService } from 'app/shared/services/company.service';
import { BusinessHour } from 'app/shared/models/company';
import { LoadingService } from 'app/shared/services/loading.service';
import { MatSnackBar } from '@angular/material/snack-bar';
@Component({
    selector: 'dashboard-vet',
    templateUrl: './dashboard.component.html',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        MatSelectModule,
        MatFormFieldModule,
        FormsModule,
        MatPaginator,
        RouterLink,
        TranslocoModule,
        MatIconModule,
        MatButtonModule,
        MatRippleModule,
        MatMenuModule,
        MatTabsModule,
        MatButtonToggleModule,
        NgApexchartsModule,
        NgFor,
        NgIf,
        MatTableModule,
        CurrencyPipe,
        DatePipe,
      
    ],
})
export class DashboardComponent implements OnInit, OnDestroy {
    disabledCartList= signal(false);
    @ViewChild(MatPaginator) paginator: MatPaginator;
    isUserListOpen = false;
    _loadingService = inject(LoadingService);
    user: any;
    users: User[] = [];
    currentSize = 10;
    currentPage = 1;
    total = 0;
    chartTaskDistribution: ApexOptions = {};
    selectedProject: string = 'ACME Corp. Backend App';
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    companyId: string = '';
    chartMostSoldCategories: any;

    teamMembers: any[] = [];
    selectedMonth: string = this.getCurrentMonth(); // Default to the current month
    appointmentPerDayData: any = {}; // Stores the data for the chart
    chartAppointmentsPerDay: any = {}; // Initialize with an empty object to prevent 'undefined' error
    availableMonths: string[] = [];

    isBusinessHoursOpen = false;
    daysOfWeek = [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
    ];
    businessHours: BusinessHour[] = [];
    originalBusinessHours: BusinessHour[] = []; // to hold a copy

    data: any = {};

    displayedColumns: string[] = [
        'num',
        'clientName',
        'totalProd',
        'totalMoney',
        'date',
    ];
    cartList: any;
    snackbar = inject(MatSnackBar);
    selectedUser: any = null;
    disabledChart = signal(false);

    visitPrice: number;
    overviewStats: any = {
        clientsCount: 0,
        petsCount: 0,
        productsCount: 0,
        appointmentsLast7Days: 0,
    };
    company: any = {};
    appointments: any[] = [];
    appointmentData = {
        total: 0,
        confirmed: 0,
        canceled: 0,
        pending: 0,
        completed: 0,
        recentAppointments: [],
    };
    timeOptions = Array.from({ length: (24 - 8 + 1) * 2 - 1 }, (_, i) => {
        const hour = 6 + Math.floor(i / 2);
        const minute = i % 2 === 0 ? '00' : '30';
        return `${hour.toString().padStart(2, '0')}:${minute}`;
    });
    originalVisitPrice: number; // to hold a copy of the original visit price
    /**
     * Constructor
     */
    constructor(
        private _dashboardVetService: dashboardVetService,
        private _router: Router,
        private _appointmentService: AppointmentService,
        private _cartService: CartService,
        private _cdr: ChangeDetectorRef,
        private _userService: UserService,
        private _companyService: CompanyService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this._loadingService.show();

        this.companyId = localStorage.getItem('connectedUserCompany') || '';
        const id = localStorage.getItem('connectedUserId');
        this.selectedMonth = this.getCurrentMonth();
        this.generateMonthOptions();

        forkJoin({
            user: this._userService.getOne(id),
            externalUsers: this._userService.getExternalUsers(this.companyId),
            team: this._dashboardVetService.getCompanyTeam(),
            overviewStats: this._dashboardVetService.getOverviewStats(),
            appointmentStats: this._dashboardVetService.getAppointmentStats(
                this.companyId,
                this.selectedMonth
            ),
            appointmentsPerDay: this._dashboardVetService.getAppointmentsPerDay(
                this.selectedMonth
            ),
            petCountBySpecies: this._dashboardVetService.getPetCountBySpecies(),
            mostSoldCategories: this._dashboardVetService.getMostSoldCategories(
                this.companyId
            ),
            cartList: this._cartService.getList(
                this.currentPage,
                this.currentSize,
                this.companyId
            ),
            allAppointments: this._appointmentService.getAllByCompany(
                this.companyId
            ),
            company: this._companyService.getOne(this.companyId),
        }).subscribe({
            next: (result) => {
                console.log(this.selectedMonth);
                this.user = result.user;
                this.users = result.externalUsers;
                this.teamMembers = result.team;
                this.overviewStats = result.overviewStats;
                this.appointmentData = result.appointmentStats;
                this.appointmentPerDayData = result.appointmentsPerDay;
                this.appointments = result.allAppointments;
                this.company = result.company;
                this.visitPrice = this.company.visitPrice || 0; // Set visit price from company data
                this.businessHours = result.company.businessHours || [];
                this.originalBusinessHours = JSON.parse(
                    JSON.stringify(this.businessHours)
                );
                this.originalVisitPrice = this.visitPrice; // <-- Save original
                this.cartList = result.cartList.data;
                this.total = result.cartList.total;

                // Chart: Appointments per day
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
                    grid: { borderColor: 'var(--fuse-border)' },
                    labels: result.appointmentsPerDay.labels,
                    legend: { show: false },
                    plotOptions: { bar: { columnWidth: '50%' } },
                    series: [
                        {
                            name: 'Appointments',
                            data: result.appointmentsPerDay.series,
                        },
                    ],
                    states: {
                        hover: { filter: { type: 'darken', value: 0.75 } },
                    },
                    stroke: { width: [3, 0] },
                    tooltip: { followCursor: true, theme: 'dark' },
                    xaxis: {
                        categories: result.appointmentsPerDay.labels,
                        axisBorder: { show: false },
                        axisTicks: { color: 'var(--fuse-border)' },
                        labels: {
                            style: { colors: 'var(--fuse-text-secondary)' },
                        },
                        tooltip: { enabled: false },
                    },
                    yaxis: {
                        min: 0,
                        forceNiceScale: true,
                        decimalsInFloat: 0,
                        labels: {
                            offsetX: -16,
                            style: { colors: 'var(--fuse-text-secondary)' },
                            formatter: (val) => Math.floor(val).toString(),
                        },
                    },
                };

                // Chart: Most Sold Categories
                const allCategories = ['Food', 'Hygiene', 'Accessories'];
                const quantitiesMap = new Map(
                    result.mostSoldCategories.map((r) => [
                        r._id,
                        r.totalQuantity,
                    ])
                );
                const categories = allCategories;
                const quantities = allCategories.map(
                    (cat) => quantitiesMap.get(cat) || 0
                );
                const maxQuantity = Math.max(...quantities);
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
                    series: [{ name: 'Sold Quantity', data: quantities }],
                    stroke: { width: 2 },
                    tooltip: {
                        theme: 'dark',
                        y: { formatter: (val: number) => `${val} sold` },
                    },
                    xaxis: {
                        categories,
                        labels: {
                            show: true,
                            style: { fontSize: '12px', fontWeight: '500' },
                        },
                    },
                    yaxis: { max: Math.ceil(maxQuantity + 1), tickAmount: 5 },
                };

                // Chart: Task Distribution (Pet count by species)
                const labels = result.petCountBySpecies.map(
                    (item: any) => item._id
                );
                const series = result.petCountBySpecies.map(
                    (item: any) => item.count
                );
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
                        hover: { filter: { type: 'darken', value: 0.75 } },
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
                    tooltip: { followCursor: true, theme: 'dark' },
                    yaxis: {
                        min: 0,
                        max: Math.max(...series, 1),
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

                this._loadingService.hide();
                this._cdr.markForCheck();
            },
            error: (err) => {
                this._loadingService.hide();
                this._cdr.markForCheck();
                // Optionally handle error
            },
        });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
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
    trackByFn(index: number, item: any): any {
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
    private _fixSvgFill(element: Element): void {
        // Current URL
        const currentURL = this._router.url;

        // 1. Find all elements with 'fill' attribute within the element
        // 2. Filter out the ones that doesn't have cross reference so we only left with the ones that use the 'url(#id)' syntax
        // 3. Insert the 'currentURL' at the front of the 'fill' attribute value
        Array.from(element.querySelectorAll('*[fill]'))
            .filter((el) => el.getAttribute('fill').indexOf('url(') !== -1)
            .forEach((el) => {
                const attrVal = el.getAttribute('fill');
                el.setAttribute(
                    'fill',
                    `url(${currentURL}${attrVal.slice(attrVal.indexOf('#'))}`
                );
            });
    }
    getCartList(): void {
        this._loadingService.show();
        this.disabledCartList.set(true);
        this._cartService
            .getList(this.currentPage, this.currentSize, this.companyId)
            .subscribe({
                next: (res) => {
                    this.cartList = res.data;
                    console.log('Cart list:', this.cartList);
                    this.total = res.total; // total number of items for pagination
                    this._loadingService.hide();
                    this.disabledCartList.set(false);
                },
                error: () => {
                    // Redirect to the 404 page
                    this._loadingService.hide();
                    this.disabledCartList.set(false);
                    this._router.navigate(['/pages/errors/404']);
                },
            });
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
        return `${date.getFullYear()}-${(date.getMonth() + 1)
            .toString()
            .padStart(2, '0')}`;
    }

    getCompanyTeam(): void {
        this._dashboardVetService.getCompanyTeam().subscribe({
            next: (members) => {
                this.teamMembers = members;
                console.log('Team members:', this.teamMembers);
            },
            error: (err) => {
                console.error('Failed to fetch team:', err);
            },
        });
    }
    pageChanged(event: any): void {
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
       
        this.disabledChart.set(true);
        this._dashboardVetService
            .getAppointmentsPerDay(this.selectedMonth)
            .subscribe({
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
                            labels: {
                                style: { colors: 'var(--fuse-text-secondary)' },
                            },
                            tooltip: { enabled: false },
                        },
                        yaxis: {
                            min: 0,
                            forceNiceScale: true, // Ensures clean intervals
                            decimalsInFloat: 0, // No decimals on axis labels
                            labels: {
                                offsetX: -16,
                                style: {
                                    colors: 'var(--fuse-text-secondary)',
                                },
                                formatter: (val) => Math.floor(val).toString(), // Ensures whole numbers
                            },
                        },
                    };
                    this.disabledChart.set(false);
                },

                error: (err) => {
                    console.error('Error fetching data:', err);
                },
            });
    }

    onMonthChange(selectedMonth: string): void {
        this.selectedMonth = selectedMonth;
        console.log('Selected month:', this.selectedMonth);
        this._loadingService.show();
        this.getAppointmentsPerDay(); // Re-fetch the data for the selected month
        this.getAppointmentStats(); // Fetch appointment stats for the selected month
    }
    getAppointmentStats(): void {
        this._dashboardVetService
            .getAppointmentStats(this.companyId, this.selectedMonth)
            .subscribe({
                next: (stats) => {
                    this.appointmentData = stats;
                    this._cdr.markForCheck();
                    this._loadingService.hide();
                },
                error: (err) => {
                    console.error('Failed to fetch appointment stats:', err);
                },
            });
    }

    /**
     * Prepare the chart data from the data
     *
     * @private
     */

    getExternalUsers(): void {
        this._userService
            .getExternalUsers(localStorage.getItem('connectedUserCompany'))
            .subscribe({
                next: (response) => {
                    this.users = response;
                    console.log('External users:', this.users);
                },
                error: (err) => {
                    console.error('Failed to fetch external users:', err);
                },
            });
    }
    openUserList() {
        this.isUserListOpen = true;
    }

    selectUser(user: any) {
        this.selectedUser = user;
        this.isUserListOpen = false;
    }

    openBusinessHours() {
        this.isBusinessHoursOpen = true;
        this._companyService
            .updateVisitSetUp(
                this.companyId,
                this.businessHours,
                this.visitPrice
            )
            .subscribe({
                next: () =>
                    console.log('Business hours and visit price updated!'),
                error: (err) => console.error('Update error:', err),
            });
        this.originalVisitPrice = this.visitPrice; // Update original after save
    }

    saveBusinessHours() {
        // Check for invalid time ranges
        const invalidDays = this.businessHours.filter(
            (bh) => bh.open && bh.close && bh.close <= bh.open
        );

        // Check for cases where only one of open/close is filled
        const incompleteDays = this.businessHours.filter(
            (bh) => (bh.open && !bh.close) || (!bh.open && bh.close)
        );

        if (invalidDays.length > 0 || incompleteDays.length > 0) {
            // Show a snackbar message for invalid input
            this.snackbar.open?.(
                'Please correct invalid or incomplete business hours.',
                'Close',
                { duration: 3000, verticalPosition: 'top' }
            );
            return;
        }

        this.isBusinessHoursOpen = false;
        this._companyService
            .updateVisitSetUp(
                this.companyId,
                this.businessHours,
                this.visitPrice
            )
            .subscribe({
                next: () => console.log('Business hours updated!'),
                error: (err) => console.error('Update error:', err),
            });
        console.log('Business hours saved:', this.businessHours);
    }

    getBusinessHours() {
        this._companyService.getOne(this.companyId).subscribe({
            next: (response) => {
                this.company = response;
                this.businessHours = this.company.businessHours;
                console.log('business Hours:', this.company);
                this.initializeBusinessHours();
                this.originalBusinessHours = JSON.parse(
                    JSON.stringify(this.businessHours)
                );
            },
            error: (error) => {
                console.error('Error fetching company:', error);
            },
        });
    }

    getBusinessHour(day: string): BusinessHour | undefined {
        return this.businessHours.find((bh) => bh.day === day);
    }
    updateBusinessHour(
        day: string,
        field: 'open' | 'close',
        value: string
    ): void {
        // Only allow times on 30-minute boundaries
        if (value) {
            const [h, m] = value.split(':').map(Number);
            if (m !== 0 && m !== 30) {
                // Optionally show a warning or auto-correct
                return;
            }
        }
        const bh = this.getBusinessHour(day);
        if (bh) {
            bh[field] = value;
        } else {
            this.businessHours.push({
                day,
                open: field === 'open' ? value : '',
                close: field === 'close' ? value : '',
            });
        }
    }

    initializeBusinessHours() {
        const defaultHours = [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday',
        ];

        // Ensure businessHours is defined
        if (!this.businessHours) {
            this.businessHours = [];
        }

        for (const day of defaultHours) {
            const exists = this.businessHours.find((bh) => bh.day === day);
            if (!exists) {
                this.businessHours.push({ day, open: '', close: '' });
            }
        }

        // Optional: sort by day order
        this.businessHours.sort(
            (a, b) => defaultHours.indexOf(a.day) - defaultHours.indexOf(b.day)
        );
    }

    trackByDay(index: number, day: string) {
        return day;
    }
    isTimeInvalid(day: string): boolean {
        const bh = this.getBusinessHour(day);
        if (!bh || !bh.open || !bh.close) return false;

        return bh.close <= bh.open;
    }
    resetBusinessHours(): void {
        // Restore original business hours
        this.businessHours = JSON.parse(
            JSON.stringify(this.originalBusinessHours)
        );
        this.visitPrice = this.originalVisitPrice; // Restore original
        this.isBusinessHoursOpen = false; // optional: close the form
    }
}
