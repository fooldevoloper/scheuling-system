export type CalendarView = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek';

export type ClassStatus = 'scheduled' | 'completed' | 'cancelled';

export interface CalendarEvent {
    id: string;
    classId: string;
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    room?: string;
    instructor?: string;
    courseCode?: string;
    classType: string;
    status?: ClassStatus;
    instanceId?: string;
}

export interface CalendarData extends Record<string, unknown[]> { }
