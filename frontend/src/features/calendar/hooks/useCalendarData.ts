import { useQuery } from '@tanstack/react-query';
import { useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import { calendarApi } from '../api/calendarApi';
import type { CalendarEvent, CalendarData } from '../types/calendar.types';
import type { CalendarQueryParams } from '@/types';

interface RawCalendarEvent {
    _id?: string;
    id?: string;
    name?: string;
    instanceDate?: string;
    instanceStartTime?: string;
    instanceEndTime?: string;
    startTime?: string;
    endTime?: string;
    room?: { name?: string };
    instructor?: { firstName?: string; lastName?: string; fullName?: string };
    courseCode?: string;
    classType?: string;
}

const transformToCalendarEvents = (data: Record<string, unknown[]>): Record<string, CalendarEvent[]> => {
    const map: Record<string, CalendarEvent[]> = {};

    Object.entries(data).forEach(([dateKey, events]) => {
        if (Array.isArray(events)) {
            map[dateKey] = events.map((event: unknown, index: number) => {
                const e = event as RawCalendarEvent;

                return {
                    id: e._id || e.id || `${dateKey}-${index}`,
                    title: e.name || 'Class',
                    date: dateKey,
                    startTime: e.instanceStartTime || e.startTime || '00:00',
                    endTime: e.instanceEndTime || e.endTime || '00:00',
                    room: e.room?.name,
                    instructor: e.instructor?.fullName || (e.instructor ? `${e.instructor.firstName} ${e.instructor.lastName}` : undefined),
                    courseCode: e.courseCode,
                    classType: e.classType || 'single',
                };
            });
        }
    });

    return map;
};

export const useCalendarData = (params: CalendarQueryParams) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['calendar', params],
        queryFn: () => calendarApi.getCalendarData(params),
    });

    const eventsMap = useMemo(() => {
        if (!data?.data) return {} as Record<string, CalendarEvent[]>;
        return transformToCalendarEvents(data.data as Record<string, unknown[]>);
    }, [data]);

    const getEventsForDay = useCallback((date: Date): CalendarEvent[] => {
        const dateKey = format(date, 'yyyy-MM-dd');
        return eventsMap[dateKey] || [];
    }, [eventsMap]);

    const getMonthStats = useCallback(() => {
        const events: CalendarEvent[] = [];
        Object.values(eventsMap).forEach(dayEvents => {
            events.push(...dayEvents);
        });
        return {
            totalClasses: events.length,
            activeDays: new Set(Object.keys(eventsMap).filter(k => eventsMap[k].length > 0)).size,
        };
    }, [eventsMap]);

    return {
        calendarData: data,
        isLoading,
        error,
        eventsMap,
        getEventsForDay,
        getMonthStats,
    };
};

export const useCalendarEventColor = (classType: string): string => {
    if (classType === 'recurring') {
        return 'bg-purple-100 text-purple-700 border-purple-200';
    }
    return 'bg-blue-100 text-blue-700 border-blue-200';
};
