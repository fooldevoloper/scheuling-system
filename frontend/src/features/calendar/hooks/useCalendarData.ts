import { useQuery } from '@tanstack/react-query';
import { useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import { calendarApi } from '../api/calendarApi';
import type { CalendarEvent, CalendarData, ClassStatus } from '../types/calendar.types';
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
    status?: string;
}

const transformToCalendarEvents = (data: Record<string, unknown[]>): Record<string, CalendarEvent[]> => {
    const map: Record<string, CalendarEvent[]> = {};

    Object.entries(data).forEach(([dateKey, events]) => {
        if (Array.isArray(events)) {
            map[dateKey] = events.map((event: unknown, index: number) => {
                const e = event as RawCalendarEvent;

                return {
                    id: e._id || e.id || `${dateKey}-${index}`,
                    classId: e._id || e.id || `${dateKey}-${index}`,
                    title: e.name || 'Class',
                    date: dateKey,
                    startTime: e.instanceStartTime || e.startTime || '00:00',
                    endTime: e.instanceEndTime || e.endTime || '00:00',
                    room: e.room?.name,
                    instructor: e.instructor?.fullName || (e.instructor ? `${e.instructor.firstName} ${e.instructor.lastName}` : undefined),
                    courseCode: e.courseCode,
                    classType: e.classType || 'single',
                    status: (e.status as ClassStatus) || undefined,
                };
            });
        }
    });

    return map;
};

export const useCalendarData = (params: CalendarQueryParams) => {
    // Create a unique query key based on date range
    const queryKey = ['calendar', params.startDate, params.endDate];

    const { data, isLoading, isFetching, error, refetch } = useQuery({
        queryKey,
        queryFn: () => calendarApi.getCalendarData(params),
        staleTime: 0, // Always fetch fresh data when navigating
        gcTime: 5 * 60 * 1000, // Cache for 5 minutes
        refetchOnWindowFocus: true,
        enabled: !!params.startDate && !!params.endDate,
    });

    const eventsMap = useMemo(() => {
        if (!data?.data) return {} as Record<string, CalendarEvent[]>;
        return transformToCalendarEvents(data.data as Record<string, unknown[]>);
    }, [data]);

    const getEventsForDay = useCallback((date: Date): CalendarEvent[] => {
        const dateKey = format(date, 'yyyy-MM-dd');
        return eventsMap[dateKey] || [];
    }, [eventsMap]);

    const getViewStats = useCallback(() => {
        const events: CalendarEvent[] = [];
        Object.values(eventsMap).forEach(dayEvents => {
            events.push(...dayEvents);
        });
        return {
            totalClasses: events.length,
            activeDays: new Set(Object.keys(eventsMap).filter(k => eventsMap[k].length > 0)).size,
        };
    }, [eventsMap]);

    const getMonthStats = useCallback(() => {
        return getViewStats();
    }, [getViewStats]);

    return {
        calendarData: data,
        isLoading,
        isFetching,
        error,
        refetch,
        eventsMap,
        getEventsForDay,
        getViewStats,
        getMonthStats,
    };
};

export const useCalendarEventColor = (classType: string): string => {
    if (classType === 'recurring') {
        return 'bg-purple-100 text-purple-700 border-purple-200';
    }
    return 'bg-blue-100 text-blue-700 border-blue-200';
};
