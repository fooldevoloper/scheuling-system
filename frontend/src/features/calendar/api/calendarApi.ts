import { apiClient } from '@/lib/api';
import type { CalendarQueryParams } from '@/types';
import type { ClassStatus } from '../types/calendar.types';

export interface UpdateClassStatusParams {
    instanceId?: string;
    status: ClassStatus;
}

export const calendarApi = {
    getCalendarData: (params: CalendarQueryParams) =>
        apiClient.get<Record<string, unknown[]>>('/classes/calendar', { params }),

    updateClassStatus: (classId: string, data: UpdateClassStatusParams) =>
        apiClient.patch(`/classes/${classId}/status`, data),
};
