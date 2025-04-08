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
import { AuthService } from 'app/shared/services/auth.service';
import { UserService } from 'app/shared/services/user.service';

import { PetService } from 'app/shared/services/pet.service';

@Component({
    selector: 'app-calendar',
    imports: [FullCalendarModule],
    templateUrl: './calendar.component.html',
})
export class CalendarComponent implements OnInit {
    eventGuid: number = 0;
    @ViewChild(FullCalendarComponent) calendarComponent!: FullCalendarComponent;
    _router = inject(Router);
    _authService = inject(AuthService);
    _petService = inject(PetService);
    _appointmentService = inject(AppointmentService);
    _userService = inject(UserService);

    pets: any[] = [];

    ngOnInit(): void {
        this.loadAppointments();
        this.loadPets();
    }

    TODAY_STR = new Date().toISOString().replace(/T.*$/, ''); // YYYY-MM-DD of today

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
        slotDuration: '0:30', // 1-hour slots
        slotLabelInterval: '0:30', // Label every hour
        slotLabelFormat: {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false, // Use 24-hour format
        },
        allDaySlot: false,

        displayEventTime: false,
        height: 'auto', // fallback
        expandRows: true, // makes grid stretch vertically
        aspectRatio: 1.35, // helps adjust calendar shape
        contentHeight: 'auto', // for auto height

        validRange: {
            start: this.TODAY_STR,
        },
        ///fixing the colored slots position
        eventDidMount: (info) => {
            const event = info.event;
            if (event.backgroundColor && event.backgroundColor !== 'grey') {
                const width = '104%';
                info.el.style.width = width;
                const leftPosition = '-1%';
                info.el.style.marginLeft = leftPosition;
            }
        },
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
    ngAfterViewInit(): void {
        setTimeout(() => {
            this.calendarComponent.getApi().updateSize();
        }, 100); // Adjust delay as necessary (100ms here)
    }
    handleDateSelect(selectInfo: DateSelectArg) {
        const calendarApi = selectInfo.view.calendar;
        const startDate = selectInfo.startStr;
        const endDate = selectInfo.endStr;
        const Blocked = calendarApi.getEvents().some((event) => {
            if (event.display !== 'background') return false;
        
            const eventStart = new Date(event.startStr).getTime();
            const eventEnd = new Date(event.endStr).getTime();
            const selectStart = new Date(startDate).getTime();
            const selectEnd = new Date(endDate).getTime();
        
            // Check for time overlap
            return (
                (selectStart >= eventStart && selectStart < eventEnd) ||
                (selectEnd > eventStart && selectEnd <= eventEnd) ||
                (selectStart <= eventStart && selectEnd >= eventEnd)
            );
        });
        if (Blocked) {
            Swal.fire({
                icon: 'warning',
                title: 'Time Unavailable',
                text: 'This time  is not available for appointments.',
                confirmButtonColor: '#f87171',
            });

            calendarApi.unselect();
            return;
        }
        Swal.fire({
            title: 'Select a Pet',
            input: 'select',
            inputOptions: this.pets.reduce((acc, pet) => {
                acc[pet._id] = `${pet.name} (${pet.species})`;
                return acc;
            }, {}),
            inputPlaceholder: 'Choose a pet...',
            showCancelButton: true,
            cancelButtonColor: '#FF5733',
            confirmButtonColor: '#4CAF50',
            inputValidator: (value) => {
                if (!value) {
                    return 'You need to select a pet!';
                }
            },
        }).then((result) => {
            if (result.isConfirmed) {
                const selectedPetId = result.value;
                const pet = this.pets.find((pet) => pet._id === selectedPetId);

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
        const currentUserId = localStorage.getItem('connectedUserId');
        console.log('test', localStorage.getItem('connectedUserId'));
        const connectedUserType = localStorage.getItem('connectedUserType');
        console.log('test', localStorage.getItem('connectedUserType'));

        this._appointmentService.getAppointments('10', '1', '').subscribe(
            (response) => {
                console.log('Appointments fetched successfully:', response);

                const appointments = response.data;
                console.log('Appointments:', appointments);

                const events: EventInput[] = appointments.flatMap((appointment: Appointment) => {
                        const startDate = new Date(appointment.date)
                            .toISOString()
                            .split('T')[0];
                            const startDateTime = new Date(`${startDate}T${appointment.time}`);
                            const endDateTime = new Date(startDateTime);
                            endDateTime.setHours(endDateTime.getHours() + 1);
                        const gapStart = new Date(endDateTime);
                        const gapEnd = new Date(gapStart);
                        gapEnd.setMinutes(gapEnd.getMinutes() + 30);
                        if (
                            appointment.userId?._id !== currentUserId &&
                            connectedUserType === 'external'
                        ) {
                            
                            return [
                                {
                                    start: startDateTime.toISOString(),
                                    end: endDateTime.toISOString(),
                                    display: 'background',
                                    editable: false,
                                    backgroundColor: 'grey',
                                },
                                {
                                    start: gapStart.toISOString(),
                                    end: gapEnd.toISOString(),
                                    display: 'background',
                                    editable: false,
                                    backgroundColor: 'grey',
                                },
                            ];
                        }
                        // secretary view
                        let title = `${appointment.userId.name} with ${appointment.petId.name} (${appointment.petId.species})`;

                        if (appointment.status === 'pending') {
                            // client view
                            if (connectedUserType === 'external') {
                                title = `${appointment.petId.name} (${appointment.petId.species})`;
                            }

                           
        return [
            {
                id: appointment._id,
                title: title,
                start: startDateTime.toISOString(),
                end: endDateTime.toISOString(),
                allDay: false,
                color: '#fbbf24',
            },
            {
                start: gapStart.toISOString(),
                end: gapEnd.toISOString(),
                display: 'background',
                editable: false,
                backgroundColor: 'grey',
            }
        ];
                        }
                        return [
                            {
                                id: appointment._id,
                                title: title,
                                start: startDateTime.toISOString(),
                                    end: endDateTime.toISOString(),
                                allDay: false,
                                color: 'green',
                            },
                            {
                                start: gapStart.toISOString(),
                                end: gapEnd.toISOString(),
                                display: 'background',
                                editable: false,
                                backgroundColor: 'grey',
                            }
                        ];
                    }
                );
                const calendarApi = this.calendarComponent.getApi();
                calendarApi.removeAllEvents();
                calendarApi.addEventSource(events);
                calendarApi.updateSize();
            },
            (error) => {
                console.error('Error fetching appointments:', error);
            }
        );
    }
    updateCalendarEvents(events: EventInput[]): void {
        const calendarApi = this.calendarComponent.getApi();
        calendarApi.addEventSource(events); // Add events to FullCalendar
    }
}
