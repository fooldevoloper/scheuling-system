import { apiClient } from '@/lib/api';
import type { ApiResponse, CalendarQueryParams } from '@/types';

export const calendarApi = {
    getCalendarData: (params: CalendarQueryParams) =>
        apiClient.get<Record<string, unknown[]>>('/classes/calendar', { params }),
};
