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
import { Appointment, Appointment2 } from 'app/shared/models/appointment';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'app/shared/services/auth.service';
import { UserService } from 'app/shared/services/user.service';

import { PetService } from 'app/shared/services/pet.service';
import { CompanyService } from 'app/shared/services/company.service';
import { User } from 'app/shared/models/user';
import { Pet } from 'app/shared/models/pet';

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
_companyService = inject(CompanyService);
_route= inject(ActivatedRoute);
    pets: any[] = [];
companyDate: string = '';
calendarFirstDate: string = '';
userType: string = '';
CalendarOptions!: CalendarOptions;
    ngOnInit(): void {
        this.loadAppointments();
        this.loadPets();
        this.userType = localStorage.getItem('connectedUserType');
        const connectedUserCompany = localStorage.getItem('connectedUserCompany');
        console.log('connectedUserCompany', connectedUserCompany);//mrigla
this._companyService.getOne(connectedUserCompany).subscribe({
    next: (company) => {
        console.log('Company:', company);
        this.companyDate = company.firstCalendarDay;
        console.log('companyDate', this.companyDate);
        console.log('type of companyDate', typeof this.companyDate);
        if (this.userType !== 'external') {
            console.log(this.userType);
            this.calendarFirstDate = this.companyDate;
            console.log("date", this.calendarFirstDate);
            
            
        }
        else {
            this.calendarFirstDate = new Date().toISOString().replace(/T.*$/, '');;
            console.log('calendarFirstDate', this.calendarFirstDate);
            
        }
        this.initializeCalendarOptions(); 

    },
error: (error) => {
    console.error('Error fetching company:', error);
}
});
this.initializeCalendarOptions(); 

    }   


    TODAY_STR = new Date().toISOString().replace(/T.*$/, ''); // YYYY-MM-DD of today
  
    calendarVisible = signal(true);
    initializeCalendarOptions(): void {
        console.log('calendarFirstDate in initializeCalendarOptions:', this.calendarFirstDate); // Log here to check if it's set
    this.CalendarOptions = {
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
        eventDrop: this.handleEventDrop.bind(this),
        businessHours: [
            {
                daysOfWeek: [ 1, 2, 3, 4 ],
                startTime: '08:00', // 8am
                endTime:'18:00'
            },
            {
                daysOfWeek: [ 5 ,6], // Thursday, Friday
                startTime: '10:00', // 10am
                endTime: '16:00' // 4pm
              }],
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
            start: this.calendarFirstDate, 
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
    }; }

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
        if(this.userType === 'external') {
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
                            icon: pet.icon,
                        },
                        companyId: localStorage.getItem('connectedUserCompany'),
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

        calendarApi.unselect();}
        /////for internal users
        else if (this.userType === 'internal') {
            const [selectedDate, selectedTime] = startDate.split('T');
            console.log('Selected date:', selectedDate);
            console.log('Selected time:', selectedTime);
            
            this._router.navigate(['add'], {
              relativeTo: this._route,
              queryParams: {
                date: selectedDate,
                time: selectedTime
              }
            }).then();
          }
    }
    handleEventClick(clickInfo: EventClickArg) {
        if (this.userType === 'external') {
            return; 
        }
        const appointmentId = clickInfo.event.id;
        console.log('Clicked appointment ID:', appointmentId);
        
        if (appointmentId) {
            this._router.navigate([`${appointmentId}`], { relativeTo: this._route }).then();
             } 
            else {
            console.warn('No appointment ID found in event');
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

    handleEventDrop(dropInfo: any) {
        const updatedStart = dropInfo.event.startStr;
        const updatedEnd = dropInfo.event.endStr;
        const appointmentId = dropInfo.event.id;
        
        console.log('Updated start date:', updatedStart);
        console.log('Updated end date:', updatedEnd);
    
        this._appointmentService.getAppointment(appointmentId).subscribe({
            next: (appointment) => {
               
                console.log('Fetched Appointment:', appointment);
                
                const updatedAppointment = {
                    ...appointment,
                    userId: appointment.userId._id,    
                    petId: appointment.petId._id,      
                    companyId: appointment.companyId,  
                    date: updatedStart.split('T')[0],  
                    time: updatedStart.split('T')[1],  
                           
                };
    
                console.log('Updated Appointment:', updatedAppointment);
                    this._appointmentService.updateAppointment(updatedAppointment).subscribe({
                    next: () => {
                            this.loadAppointments();  
                    
                    },
                    error: (err) => {
                        console.error('Error updating appointment:', err);
                    },
                });
            },
            error: (err) => {
                console.error('Error fetching appointment:', err);
            }
        });
    }
}
