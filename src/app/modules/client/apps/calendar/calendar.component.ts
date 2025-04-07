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
import { AnimalService } from 'app/shared/services/animal.service';
import { AuthService } from 'app/shared/services/auth.service';
import { UserService } from 'app/shared/services/user.service';

@Component({
    selector: 'app-calendar',
    imports: [FullCalendarModule],
    templateUrl: './calendar.component.html',

})
export class CalendarComponent implements OnInit {
    eventGuid: number = 0;
    @ViewChild(FullCalendarComponent) calendarComponent!: FullCalendarComponent;
    animals: any[] = [];
    _router= inject(Router);
    _authService= inject(AuthService);
    _animalService= inject(AnimalService);
    _appointmentService= inject(AppointmentService);
    _userService= inject(UserService);
    

    ngOnInit(): void {
        this.loadAppointments();
        this.loadAnimals();
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
        
        displayEventTime: false,
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
    ngAfterViewInit(): void {
        setTimeout(() => {
            this.calendarComponent.getApi().updateSize();
        }, 100); // Adjust delay as necessary (100ms here)
    }
    handleDateSelect(selectInfo: DateSelectArg) {
        const calendarApi = selectInfo.view.calendar;
        const startDate = selectInfo.startStr;
        const endDate = selectInfo.endStr;

        Swal.fire({
            title: 'Select an Animal',
            input: 'select',
            inputOptions: this.animals.reduce((acc, animal) => {
                acc[animal._id] = `${animal.name} (${animal.species})`;
                return acc;
            }, {}),
            inputPlaceholder: 'Choose an animal...',
            showCancelButton: true,
            cancelButtonColor: '#FF5733',
            confirmButtonColor: '#4CAF50',
            inputValidator: (value) => {
                if (!value) {
                    return 'You need to select an animal!';
                }
            },
        }).then((result) => {
            if (result.isConfirmed) {
                const selectedAnimalId = result.value;
                const animal = this.animals.find(
                    (animal) => animal._id === selectedAnimalId
                );

                if (animal) {
                    const appointment: Appointment = {
                        userId: {
                            _id: animal.ownerId._id,
                            name: animal.ownerId._id,
                        },
                        animalId: {
                            _id: animal._id,
                            name: animal.name,
                            species: animal.species,
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
    loadAnimals(): void {
        this._animalService.getList('10', '1', '').subscribe(
            (response) => {
                this.animals = response.data;
                console.log('Animals loaded:', this.animals);
            },
            (error) => {
                console.error('Error loading animals:', error);
                console.log(
                    'Error!',
                    'There was an error loading the animals.',
                    'error'
                );
            }
        );
    }

 
    loadAppointments(): void {
        const currentUserId = localStorage.getItem('connectedUserId'); 
 console.log("test",localStorage.getItem('connectedUserId'));
        this._appointmentService.getAppointments('10', '1', '').subscribe(
            (response) => {
                console.log('Appointments fetched successfully:', response);
    
                const appointments = response.data;
                console.log('Appointments:', appointments);
    
                const events: EventInput[] = appointments.map((appointment: Appointment) => {
                    const startDate = new Date(appointment.date).toISOString().split('T')[0];
                    const startTime = `${startDate}T${appointment.time}`;
                    const endHour = (parseInt(appointment.time.split(':')[0]) + 1).toString().padStart(2, '0');
                    const endTime = `${startDate}T${endHour}:00`;
    
                    if (appointment.userId._id !== currentUserId) {
                        return {
                            start: startTime,
                            end: endTime,
                            display: 'background',
                            backgroundColor: 'grey' 
                        };
                    }
    if(appointment.status === 'pending') {
                    return {
                        id: appointment._id,
                        title: `${appointment.userId.name} with ${appointment.animalId.name} (${appointment.animalId.species})`,
                        start: startTime,
                        end: endTime,
                        allDay: false,
                        color: '#fbbf24', 
                    };
                }
                return {
                    id: appointment._id,
                    title: `${appointment.userId.name} with ${appointment.animalId.name} (${appointment.animalId.species})`,
                    start: startTime,
                    end: endTime,
                    allDay: false,
                    color: 'green', 
                };}
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
