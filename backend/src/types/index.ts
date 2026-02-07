// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
    title: string;
    message: string;
    data: T;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: Pagination;
}

export interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ApiError {
    title: string;
    message: string;
    errors: FieldError[];
}

export interface FieldError {
    field: string;
    message: string;
}

// ============================================
// Class Types
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

export interface UpdateClassDTO extends Partial<CreateClassDTO> {
    isActive?: boolean;
}

// ============================================
// Room Types
// ============================================

export interface CreateRoomTypeDTO {
    name: string;
    capacity: number;
    description?: string;
    amenities?: string[];
}

export interface UpdateRoomTypeDTO extends Partial<CreateRoomTypeDTO> {
    isActive?: boolean;
}

export interface CreateRoomDTO {
    name: string;
    roomTypeId: string;
    building?: string;
    floor?: number;
}

export interface UpdateRoomDTO extends Partial<CreateRoomDTO> {
    isActive?: boolean;
}

// ============================================
// Instructor Types
// ============================================

export interface CreateInstructorDTO {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    specialization?: string;
    bio?: string;
    avatar?: string;
}

export interface UpdateInstructorDTO extends Partial<CreateInstructorDTO> {
    isActive?: boolean;
}

// ============================================
// Filter Types
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

export interface PaginationParams {
    page?: number;
    limit?: number;
}

// ============================================
// Calendar Types
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
