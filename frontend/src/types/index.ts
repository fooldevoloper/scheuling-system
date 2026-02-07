// API Response Types
export interface ApiResponse<T> {
    title: string;
    message: string;
    data: T;
}

export interface PaginatedResponse<T> {
    title: string;
    message: string;
    data: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface ApiError {
    title: string;
    message: string;
    errors: {
        field: string;
        message: string;
    }[];
}

// Room Types
export interface RoomType {
    _id: string;
    name: string;
    capacity: number;
    description?: string;
    amenities: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface RoomTypeFormData {
    name: string;
    capacity: number;
    description?: string;
    amenities: string[];
}

export interface Room {
    _id: string;
    name: string;
    roomTypeId: string;
    roomType?: RoomType;
    building?: string;
    floor?: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface RoomFormData {
    name: string;
    roomTypeId: string;
    building?: string;
    floor?: number;
}

// Instructor Types
export interface Instructor {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    specialization?: string;
    bio?: string;
    avatar?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface InstructorFormData {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    specialization?: string;
    bio?: string;
}

// Class Types
export type ClassType = 'single' | 'recurring';
export type RecurrencePattern = 'daily' | 'weekly' | 'monthly' | 'custom';
export type InstanceStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';

export interface TimeSlot {
    startTime: string;
    endTime: string;
}

export interface Recurrence {
    pattern: RecurrencePattern;
    daysOfWeek?: number[];
    dayOfMonth?: number[];
    interval?: number;
    timeSlots: TimeSlot[];
    endDate?: string;
    occurrences?: number;
    customRules?: string;
}

export interface ClassInstance {
    _id: string;
    parentClassId: string;
    date: string;
    startTime: string;
    endTime: string;
    instructorId: string;
    instructor?: Instructor;
    roomId?: string;
    room?: Room;
    status: InstanceStatus;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Class {
    _id: string;
    name: string;
    description?: string;
    courseCode?: string;
    instructorId: string;
    instructor?: Instructor;
    roomTypeId: string;
    roomType?: RoomType;
    roomId?: string;
    room?: Room;
    classType: ClassType;
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
    recurrence?: Recurrence;
    generatedInstances?: ClassInstance[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

// Single Class Form Data
export interface SingleClassFormData {
    name: string;
    description?: string;
    courseCode?: string;
    instructorId: string;
    roomTypeId: string;
    roomId?: string;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
}

// Recurring Class Form Data
export interface RecurringClassFormData {
    name: string;
    description?: string;
    courseCode?: string;
    instructorId: string;
    roomTypeId: string;
    roomId?: string;
    startDate: string;
    endDate?: string;
    recurrence: {
        pattern: RecurrencePattern;
        daysOfWeek?: number[];
        dayOfMonth?: number[];
        interval?: number;
        timeSlots: TimeSlot[];
        endDate?: string;
        occurrences?: number;
        customRules?: string;
    };
}

// Query Parameters
export interface ClassesQueryParams {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    instructorId?: string;
    roomTypeId?: string;
    roomId?: string;
    pattern?: RecurrencePattern;
}

export interface CalendarQueryParams {
    startDate: string;
    endDate: string;
    view?: 'month' | 'week' | 'day';
}
