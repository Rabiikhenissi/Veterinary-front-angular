import { ChangeDetectorRef, Component ,inject,signal} from '@angular/core';

import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, DateSelectArg, EventClickArg, EventApi,EventInput  } from '@fullcalendar/core';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';

@Component({
  selector: 'app-calendar',
  imports: [FullCalendarModule],
  templateUrl: './calendar.component.html',
  
})


export class CalendarComponent  {

constructor() {
  let eventGuid = 0;
}

 
 TODAY_STR = new Date().toISOString().replace(/T.*$/, ''); // YYYY-MM-DD of today
   
 INITIAL_EVENTS: EventInput[] = [
  {
    id: "1",
    title: 'All-day event',
    start: this.TODAY_STR
  },
  {
    id: "2",
    title: 'Timed event',
    start: this.TODAY_STR + 'T00:00:00',
    end: this.TODAY_STR + 'T03:00:00'
  },
  {
    id: "3",
    title: 'Timed event',
    start: this.TODAY_STR + 'T12:00:00',
    end: this.TODAY_STR + 'T15:00:00'
  }
];


  calendarVisible = signal(true);
  calendarOptions = signal<CalendarOptions>({
    plugins: [
      interactionPlugin,
      dayGridPlugin,
      timeGridPlugin,
      listPlugin,
    ],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },
    initialView: 'dayGridMonth',
    initialEvents: this.INITIAL_EVENTS, // alternatively, use the `events` setting to fetch from a feed
    initialDate: this.TODAY_STR,
    height: 'auto',
    weekends: true,
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    fixedWeekCount:false,
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventsSet: this.handleEvents.bind(this)
    /* you can update a remote database when these fire:
    eventAdd:
    eventChange:
    eventRemove:
    */
  });
  currentEvents = signal<EventApi[]>([]);

 
  changeDetector=inject(ChangeDetectorRef);

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
    const title = prompt('Please enter a new title for your event');
    const calendarApi = selectInfo.view.calendar;

    calendarApi.unselect(); // clear date selection

    if (title) {
      calendarApi.addEvent({
        id: "4",
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay
      });
    }
  }

  handleEventClick(clickInfo: EventClickArg) {
    if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)) {
      clickInfo.event.remove();
    }
  }

  handleEvents(events: EventApi[]) {
    this.currentEvents.set(events);
    this.changeDetector.detectChanges(); // workaround for pressionChangedAfterItHasBeenCheckedError
  }
  
  
}
function createEventId() {
  return String(this.eventGuid++);
}