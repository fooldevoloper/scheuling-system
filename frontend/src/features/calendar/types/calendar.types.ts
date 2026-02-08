export type CalendarView = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek';

export interface CalendarEvent {
    id: string;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    room?: string;
    instructor?: string;
    courseCode?: string;
    classType: string;
    status?: string;
}

export interface CalendarData extends Record<string, unknown[]> { }
