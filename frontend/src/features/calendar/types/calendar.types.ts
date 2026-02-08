export type CalendarView = 'month';

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
}

export interface CalendarData extends Record<string, unknown[]> { }
