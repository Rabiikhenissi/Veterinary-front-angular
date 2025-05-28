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
import { CommonModule } from '@angular/common';
import { NotificationService } from 'app/shared/services/notification.service';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { LoadingService } from 'app/shared/services/loading.service';
import { BusinessHour } from 'app/shared/models/company';

@Component({
    selector: 'app-calendar',
    imports: [FullCalendarModule,CommonModule],
    templateUrl: './appointments.component.html',
    styleUrls: ['./appointments.component.scss'],})
export class CalendarComponent implements OnInit {
    eventGuid: number = 0;
    @ViewChild(FullCalendarComponent) calendarComponent!: FullCalendarComponent;
    _router = inject(Router);
    _authService = inject(AuthService);
    _petService = inject(PetService);
    _appointmentService = inject(AppointmentService);
    _userService = inject(UserService);
    _notificationService = inject(NotificationService);
    _fuseConfirmationService=inject(FuseConfirmationService)
    _loadingService=inject(LoadingService)
_companyService = inject(CompanyService);
_route= inject(ActivatedRoute);
    pets: any[] = [];
companyDate: string = '';
calendarFirstDate: string = '';
userType: string = '';
CalendarOptions!: CalendarOptions;
connectedUser;
ngOnInit(): void {
  this.loadAppointments();
  this.loadPets();
  const savedDate = localStorage.getItem('calendarDate');
  const connectedUserCompany = localStorage.getItem('connectedUserCompany');
  this.userType = localStorage.getItem('connectedUserType');
  const connectedUserId = localStorage.getItem('connectedUserId');
  
        this._userService.getOne(connectedUserId).subscribe({
            next: (user) => {
                this.connectedUser = user;
                console.log('Connected User:', this.connectedUser);
            },
            error: (error) => {
                console.error('Error fetching connected user:', error);
            },
        });
        console.log('connectedUserCompany', connectedUserCompany);//mrigla
  this.getBusinessHours(connectedUserCompany);
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
            
        }
        this.initializeCalendarOptions(); 
        if (savedDate) {
            
                const calendarApi = this.calendarComponent.getApi();
                calendarApi.gotoDate(savedDate);
                localStorage.removeItem('calendarDate');
           }

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
      console.log("tesssssssssssss",typeof(this.businessHoursList))
        console.log('calendarFirstDate in initializeCalendarOptions:', this.calendarFirstDate); // Log here to check if it's set
    const formattedBusinessHours = this.convertToBusinessHoursFormat(this.businessHoursList);
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
        height: 'auto',
                selectable: true,
        selectMirror: true,
        dayMaxEvents: true,
        fixedWeekCount: false,
        eventOverlap: false,
        slotMinTime: '06:00:00',
        slotMaxTime: '22:30:00',
        select: this.handleDateSelect.bind(this),
        eventClick: this.handleEventClick.bind(this),
        eventsSet: this.handleEvents.bind(this),
        eventDrop: this.handleEventDrop.bind(this),
        businessHours: formattedBusinessHours,
        // Set slot duration
        slotDuration: '0:30',
        slotLabelInterval: '0:30', 
        slotLabelFormat: {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false, 
        },
        allDaySlot: false,
        expandRows: true,
        displayEventTime: false,
        aspectRatio: 1.35, 
        contentHeight: 1, 
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
            const container = document.querySelector('.full-calendar-container') as HTMLElement;
            const calendarApi = this.calendarComponent.getApi();
        
            if (container && calendarApi) {
                const height = container.clientHeight;
                console.log('Container Height:', height);
                
                // Set the calendar's height to match the container's height
                calendarApi.setOption('height', height); 
                calendarApi.updateSize(); // Update calendar size
                
                console.log('Updated Calendar Height:', calendarApi.getOption('height'));
            }
        }, 300); // Ensure that this happens after the calendar has been rendered
    }
    handleDateSelect(selectInfo: DateSelectArg) {
        const calendarApi = selectInfo.view.calendar;
        const startDate = selectInfo.startStr;
        const endDate = selectInfo.endStr;
        const selectStart = new Date(startDate); 
        const selectEnd = new Date(endDate);
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
        if (!this.businessHours(selectStart)) {
            Swal.fire({
                icon: 'info',
                title: 'Outside business hours',
                text: 'This time  is outside of our business hours.',
                confirmButtonColor: '#f87171',
            });

            calendarApi.unselect();
            return;
        }
        if(this.userType === 'external') {
            if(this.connectedUser.petId.length === 0) {
                Swal.fire({
                    icon: 'warning',
                    title: 'No Pets Found',
                    text: 'You need to add a pet before making an appointment.',
                    confirmButtonColor: '#f87171',
                });
            return;}
            
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
                            name: pet.ownerId.name,
                        },
                        petId: {
                            _id: pet._id,
                            name: pet.name,
                            species: pet.species,
                            icon: pet.icon,
                        },
                        companyId: localStorage.getItem('connectedUserCompany'),
                        date: startDate.split('T')[0],
                        time: startDate.split('T')[1]?.split('+')[0]?.substring(0, 5),
                        
                        status: 'pending',
                    };

                    this._appointmentService
                        .createAppointment(appointment)
                        .subscribe(
                            (response) => {
                                const title = 'New Appointment Booked';
                                const message = `A new appointment has been booked by ${appointment.userId.name} for their pet ${appointment.petId.name} (${appointment.petId.species}).\nThe appointment is scheduled for ${appointment.date} at ${appointment.time}.`;
                                const type = 'Appointment Booking';
                                
                                this._userService.getInternalUsers().subscribe({
                                    next: (internalUsersResponse: any) => {
                                      const internalUsers = internalUsersResponse?.data;
                                      if (Array.isArray(internalUsers)) {
                                        internalUsers.forEach(user => {
                                          this._notificationService.createNotification({
                                            userId: user._id,
                                            title: title,
                                            message: message,
                                            type: type
                                          }).subscribe(() => {
                                             this._notificationService.sendEmailNotification(
                                              user.email,
                                              title,
                                              message
                                            ).subscribe(() => {
                                              console.log(`Email sent to internal user ${user.name}`);
                                            }, (error) => {
                                              console.error('Error sending email to internal user:', error);
                                            });
                                          }, (error) => {
                                            console.error('Error sending notification to internal user:', error);
                                          });
                                        });
                                      } else {
                                        console.error('Expected an array but got:', internalUsers);
                                      }
                                    },
                                    error: (error) => {
                                      console.error('Error fetching internal users:', error);
                                    }
                                  });
                            
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
            //to save in which date before navigating
            const calendarApi = this.calendarComponent.getApi(); 
            const currentDate = calendarApi.getDate();
            localStorage.setItem('calendarDate', currentDate.toISOString());
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
        const appointmentId = clickInfo.event.id;
        console.log('Clicked appointment ID:', appointmentId);
        if (this.userType === 'external') {
            const confirmation = this._fuseConfirmationService.open({
      title: 'Cancel Appointment',
      message: 'Are you sure you want to cancel this appointment? This action cannot be undone.',
      actions: {
        confirm: {
          label: 'Yes',
        },
        cancel: {
          label: 'No',
        },
      },
    });
    confirmation.afterClosed().subscribe((result) => {
      if (result === 'confirmed') {
        this._loadingService.show(); // Optional loading indicator
        this._appointmentService.archiveAppointment(appointmentId).subscribe({
          next: () => {
            this._loadingService.hide();

            // Optionally remove the event from calendar view
            const calendarApi = this.calendarComponent.getApi();
            calendarApi.getEventById(`${appointmentId}-gap`)?.remove();
            calendarApi.getEventById(appointmentId)?.remove(); // Also remove the appointment event

            // Remove the associated break event
            const breakEvent = calendarApi.getEventById(`break-${appointmentId}`);
            if (breakEvent) {
            breakEvent.remove();
            }
          },
          error: (error) => {
            this._loadingService.hide();
            console.error('Error canceling appointment:', error);
            // You can also show a toast here
          }
        });
      }
    });
            return; 
        }
        
        
        if (appointmentId) {
            const calendarApi = this.calendarComponent.getApi(); 
            const currentDate = calendarApi.getDate();
            localStorage.setItem('calendarDate', currentDate.toISOString());
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

        const currentUserId = localStorage.getItem('connectedUserId');
        this._petService.getList('10', '1', '',currentUserId).subscribe(

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

////// Business hours
    businessHours(date: Date): boolean {
        const day = date.getDay(); 
        const hour = date.getHours();
        const minute = date.getMinutes();
    
        const timeInMinutes = hour * 60 + minute;
    
        for (const hours of this.CalendarOptions.businessHours as any[]) {
            if (hours.daysOfWeek.includes(day)) {
                const [startHour, startMin] = hours.startTime.split(':').map(Number);
                const [endHour, endMin] = hours.endTime.split(':').map(Number);
    
                const startMinutes = startHour * 60 + startMin;
                const endMinutes = endHour * 60 + endMin;
    
                if (timeInMinutes >= startMinutes && timeInMinutes < endMinutes) {
                    return true;
                }
            }
        }
    
        return false;
    }
    

    loadAppointments(): void {
        const currentUserId = localStorage.getItem('connectedUserId');
        console.log('Current User ID:', currentUserId);
        const connectedUserType = localStorage.getItem('connectedUserType');
        console.log('User Type:', connectedUserType);
        const connectedUserCompany = localStorage.getItem('connectedUserCompany');
      
        this._appointmentService.getAppointments('100', '1', '', connectedUserCompany).subscribe(
          (response) => {
            console.log('Appointments fetched successfully:', response);
      
            const appointments = response.data;
            console.log('Appointments:', appointments);
      
            const events: EventInput[] = appointments
              .map((appointment: Appointment) => {
                const startDate = new Date(appointment.date).toISOString().split('T')[0];
                const startDateTime = new Date(`${startDate}T${appointment.time}`);
                const endDateTime = new Date(startDateTime);
                endDateTime.setHours(endDateTime.getHours() + 1);
                
                const gapStart = new Date(endDateTime);
                const gapEnd = new Date(gapStart);
                gapEnd.setMinutes(gapEnd.getMinutes() + 30);
        
                if (appointment.userId?.['_id'] !== currentUserId && connectedUserType === 'external') {
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
        
                // Secretary or internal user view
                let title = `${appointment.userId?.name || 'Unknown User'} with ${appointment.petId?.name || 'Unknown Pet'} (${appointment.petId?.species || 'Unknown Species'})`;
                console.log('Appointment Title:', title);
        
                if (appointment.status === 'pending') {
                  // External user view
                  if (connectedUserType === 'external') {
                    title = `${appointment.petId?.name || 'Unknown Pet'} (${appointment.petId?.species || 'Unknown Species'})`;
                  }
        
                  return [
                    {
                      id: appointment._id,
                      title: title,
                      start: startDateTime.toISOString(),
                      end: endDateTime.toISOString(),
                      allDay: false,
                      color: '#fbbf24', // Orange for pending
                    },
                    {
                      id: `${appointment._id}-gap`, 
                      start: gapStart.toISOString(),
                      end: gapEnd.toISOString(),
                      display: 'background',
                      editable: false,
                      backgroundColor: 'grey',
                    },
                  ];
                }
        
                return [
                  {
                    id: appointment._id,
                    title: title,
                    start: startDateTime.toISOString(),
                    end: endDateTime.toISOString(),
                    allDay: false,
                    color: 'green', // Green for confirmed appointments
                  },
                  {
                  id: `${appointment._id}-gap`, 
                    start: gapStart.toISOString(),
                    end: gapEnd.toISOString(),
                    display: 'background',
                    editable: false,
                    backgroundColor: 'grey',
                  },
                ];
              })
              .flat();
      
            // Updating calendar with the events
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
        calendarApi.addEventSource(events); 
    }

    handleEventDrop(dropInfo: any) {
        const updatedStart = dropInfo.event.startStr;
        const updatedEnd = dropInfo.event.endStr;
        const appointmentId = dropInfo.event.id;
    const updatedStartDate = new Date(updatedStart);
      if (!this.businessHours(updatedStartDate)) {
        Swal.fire({
            icon: 'info',
            title: 'Outside business hours',
            text: 'This time  is outside of our business hours.',
            confirmButtonColor: '#f87171',
        }).then(() => {
            dropInfo.revert();
        });
        return;
    }
        this._appointmentService.getAppointment(appointmentId).subscribe({
            next: (appointment) => {
               
                console.log('Fetched Appointment:', appointment);
                
                const updatedAppointment = {
                    ...appointment,
                    userId: appointment.userId._id,    
                    petId: appointment.petId._id,      
                    companyId: appointment.companyId,  
                    date: updatedStart.split('T')[0],  
                    time: updatedStart.split('T')[1]?.split('+')[0]?.substring(0, 5), 
                           
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
     private convertToBusinessHoursFormat(businessHours: BusinessHour[]): any[] {
  const dayMap = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  return businessHours
    .filter(bh => bh.open && bh.close)
    .map(bh => {
      const normalizedDay = bh.day.charAt(0).toUpperCase() + bh.day.slice(1).toLowerCase();
      const dayIndex = dayMap[normalizedDay];

      if (dayIndex === undefined) {
        console.warn(`Invalid day: ${bh.day}`);
        return null;
      }

      return {
        daysOfWeek: [dayIndex],
        startTime: bh.open,
        endTime: bh.close
      };
    })
    .filter(Boolean); // Remove nulls
}


businessHoursList: BusinessHour[] = [];

getBusinessHours(companyId) {
  this._companyService.getOne(companyId).subscribe({
    next: (response: any) => {
      const company = response;
      this.businessHoursList = company.businessHours || [];
      
      this.initializeCalendarOptions(); // 👈 Initialize calendar with company times
    },
    error: (error) => {
      console.error('Error fetching company:', error);
    }
  });
}
}
