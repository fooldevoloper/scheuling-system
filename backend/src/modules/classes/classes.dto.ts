// ============================================
// Class DTOs and Types
// ============================================

export type ClassType = 'single' | 'recurring';
export type RecurrencePattern = 'daily' | 'weekly' | 'monthly' | 'custom';
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type InstanceStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';

export interface TimeSlot {
    startTime: string; // "HH:mm" format
    endTime: string;
}

export interface RecurrenceConfig {
    pattern: RecurrencePattern;
    daysOfWeek?: DayOfWeek[]; // 0-6 (Sunday-Saturday)
    dayOfMonth?: number[]; // 1-31
    interval?: number; // Every N days/weeks/months
    timeSlots: TimeSlot[];
    endDate?: Date;
    occurrences?: number; // Max occurrences
    customRules?: string; // RRule compatible string
    exclusionDates?: string[]; // Dates to exclude (YYYY-MM-DD format)
    excludeWeekends?: boolean; // Whether to exclude weekends
}

// ============================================
// Create Class DTO
// ============================================

export interface CreateClassDTO {
    name: string;
    description?: string;
    courseCode?: string;
    instructorId: string;
    roomTypeId: string;
    roomId?: string;
    classType: ClassType;
    startDate: string;
    endDate?: string;
    startTime: string;
    endTime: string;
    recurrence?: RecurrenceConfig;
}

// ============================================
// Update Class DTO
// ============================================

export interface UpdateClassDTO extends Partial<CreateClassDTO> {
    isActive?: boolean;
}

// ============================================
// Class Filters
// ============================================

export interface ClassFilters {
    startDate?: string;
    endDate?: string;
    instructorId?: string;
    roomTypeId?: string;
    roomId?: string;
    pattern?: RecurrencePattern | 'single';
    search?: string;
}

// ============================================
// Pagination Params
// ============================================

export interface PaginationParams {
    page?: number;
    limit?: number;
}

// ============================================
// Calendar Data Types
// ============================================

export interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    classType: ClassType;
    classId: string;
    instructor?: {
        id: string;
        name: string;
    };
    room?: {
        id: string;
        name: string;
    };
    color?: string;
}

export interface CalendarData {
    [date: string]: CalendarEvent[];
}

// ============================================
// Response Types
// ============================================

export interface ClassListResponse {
    data: any[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

// ============================================
// Generate Instances DTO
// ============================================

export interface GenerateInstancesDTO {
    generateUntil: string; // ISO date string
}

// ============================================
// Update Class Status DTO
// ============================================

export type ClassStatus = 'scheduled' | 'completed' | 'cancelled';

export interface UpdateClassStatusDTO {
    instanceId?: string; // For recurring classes - specific instance to update
    status: ClassStatus;
}
