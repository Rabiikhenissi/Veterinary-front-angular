import {
    ChangeDetectorRef,
    Component,
    inject,
    OnInit,
    signal,
    ViewChild,
} from '@angular/core';
import Swal from 'sweetalert2';
import {
    FullCalendarComponent,
    FullCalendarModule,
} from '@fullcalendar/angular';
import {
    CalendarOptions,
    DateSelectArg,
    EventClickArg,
    EventApi,
    EventInput,
} from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { AppointmentService } from 'app/shared/services/appointment.service';
import { Appointment } from 'app/shared/models/appointment';
import { Router } from '@angular/router';
import { PetService } from 'app/shared/services/pet.service';

@Component({
    selector: 'app-calendar',
    imports: [FullCalendarModule],
    templateUrl: './calendar.component.html',
    styleUrls: ['./calendar.component.css'],
})
export class CalendarComponent implements OnInit {
    eventGuid: number = 0;
    @ViewChild(FullCalendarComponent) calendarComponent!: FullCalendarComponent;
    pets: any[] = [];
    constructor(
        private _appointmentService: AppointmentService,
        private _router: Router,
        private _petService: PetService
    ) {}

    ngOnInit(): void {
        this.loadAppointments();
        this.loadPets();
    }

    TODAY_STR = new Date().toISOString().replace(/T.*$/, ''); // YYYY-MM-DD of today

    INITIAL_EVENTS: EventInput[] = [
        {
            id: '1',
            title: 'All-day event',
            start: this.TODAY_STR,
        },
        {
            id: '2',
            title: 'Timed event',
            start: this.TODAY_STR + 'T00:00:00',
            end: this.TODAY_STR + 'T03:00:00',
        },
        {
            id: '3',
            title: 'Timed event',
            start: this.TODAY_STR + 'T12:00:00',
            end: this.TODAY_STR + 'T15:00:00',
        },
    ];

    calendarVisible = signal(true);
    calendarOptions: CalendarOptions = {
        plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, listPlugin],
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
        },
        initialView: 'timeGridWeek', // Or 'timeGridDay' depending on your needs
        initialDate: this.TODAY_STR,
        weekends: true,
        editable: true,
        selectable: true,
        selectMirror: true,
        dayMaxEvents: true,
        fixedWeekCount: false,
        select: this.handleDateSelect.bind(this),
        eventClick: this.handleEventClick.bind(this),
        eventsSet: this.handleEvents.bind(this),

        // Set slot duration
        slotDuration: '01:00', // 1-hour slots
        slotLabelInterval: '01:00', // Label every hour
        slotLabelFormat: {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false, // Use 24-hour format
        },

        contentHeight: 'auto',
    };

    currentEvents = signal<EventApi[]>([]);

    changeDetector = inject(ChangeDetectorRef);

    // handleCalendarToggle() {
    //   this.calendarVisible.update((bool) => !bool);
    // }

    // handleWeekendsToggle() {
    //   this.calendarOptions.update((options) => ({
    //     ...options,
    //     weekends: !options.weekends,
    //   }));
    // }

    handleDateSelect(selectInfo: DateSelectArg) {
        const calendarApi = selectInfo.view.calendar;
        const startDate = selectInfo.startStr;
        const endDate = selectInfo.endStr;

        Swal.fire({
            title: 'Select an Pet',
            input: 'select',
            inputOptions: this.pets.reduce((acc, pet) => {
                acc[pet._id] = `${pet.name} (${pet.species})`;
                return acc;
            }, {}),
            inputPlaceholder: 'Choose an pet...',
            showCancelButton: true,
            cancelButtonColor: '#FF5733',
            confirmButtonColor: '#4CAF50',
            inputValidator: (value) => {
                if (!value) {
                    return 'You need to select an pet!';
                }
            },
        }).then((result) => {
            if (result.isConfirmed) {
                const selectedPetId = result.value;
                const pet = this.pets.find(
                    (pet) => pet._id === selectedPetId
                );

                if (pet) {
                    const appointment: Appointment = {
                        userId: {
                            _id: pet.ownerId._id,
                            name: pet.ownerId._id,
                        },
                        petId: {
                            _id: pet._id,
                            name: pet.name,
                            species: pet.species,
                        },
                        companyId: '62c2c6ba6b473700112d5c26',
                        date: startDate.split('T')[0],
                        time: startDate.split('T')[1],
                        status: 'pending',
                    };

                    this._appointmentService
                        .createAppointment(appointment)
                        .subscribe(
                            (response) => {
                                Swal.fire({
                                    title: 'Appointment created!',
                                    text: 'Your appointment has been added.Waiting for confirmation.',
                                    icon: 'success',
                                    confirmButtonText: 'OK', 
                                    confirmButtonColor: '#28a745', 
                                }).then(() => {
                                    calendarApi.removeAllEvents();
                                    this.loadAppointments();
                                });
                            },
                            (error) => {
                                Swal.fire(
                                    'Error!',
                                    'There was an error creating the appointment.',
                                    'error'
                                );
                                console.error(
                                    'Error creating appointment:',
                                    error
                                );
                            }
                        );
                }
            }
        });

        calendarApi.unselect();
    }
    handleEventClick(clickInfo: EventClickArg) {
        if (
            confirm(
                `Are you sure you want to delete the event '${clickInfo.event.title}'`
            )
        ) {
            clickInfo.event.remove();
        }
    }

    handleEvents(events: EventApi[]) {
        this.currentEvents.set(events);
        this.changeDetector.detectChanges(); // workaround for pressionChangedAfterItHasBeenCheckedError
    }
    loadPets(): void {
        this._petService.getList('10', '1', '').subscribe(
            (response) => {
                this.pets = response.data;
                console.log('Pets loaded:', this.pets);
            },
            (error) => {
                console.error('Error loading pets:', error);
                console.log(
                    'Error!',
                    'There was an error loading the pets.',
                    'error'
                );
            }
        );
    }

    loadAppointments(): void {
        console.log('Loading appointments...');

        this._appointmentService.getAppointments('10', '1', '').subscribe(
            (response) => {
                console.log('Appointments fetched successfully:', response);

                const appointments = response.data;
                console.log(' Appointments:', appointments);

                const events: EventInput[] = appointments.map(
                    (appointment: Appointment) => ({
                        id: appointment._id,
                        title: ` Mr. ${appointment.userId.name} with ${appointment.petId.name} (${appointment.petId.species})`,
                        start:
                            new Date(appointment.date)
                                .toISOString()
                                .replace(/T.*$/, '') +
                            'T' +
                            appointment.time, // Format the start time
                        end:
                            new Date(appointment.date)
                                .toISOString()
                                .replace(/T.*$/, '') +
                            'T' +
                            (
                                parseInt(appointment.time.split(':')[0]) + 1
                            ).toString() +
                            ':00', // Add 1 hour to the start time for the end time
                        allDay: false, // You can adjust this based on your requirement
                    })
                );

                console.log('Mapped Events:', events); // Log mapped events to check the transformation

                this.updateCalendarEvents(events);
            },
            (error) => {
                console.error('Error fetching appointments:', error); // Log any error
            }
        );
    }
    updateCalendarEvents(events: EventInput[]): void {
        const calendarApi = this.calendarComponent.getApi();
        calendarApi.addEventSource(events); // Add events to FullCalendar
    }
}
