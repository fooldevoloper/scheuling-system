import { format, parse, addDays, addWeeks, addMonths, isAfter, isBefore, startOfDay, endOfDay, isSameDay, getDay, getDate } from 'date-fns';

// ============================================
// Time Formatting Utilities
// ============================================

/**
 * Format time string to "HH:mm" format
 */
export const formatTime = (date: Date): string => {
    return format(date, 'HH:mm');
};

/**
 * Parse time string to Date object
 */
export const parseTime = (timeString: string, baseDate: Date = new Date()): Date => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date(baseDate);
    date.setHours(hours, minutes, 0, 0);
    return date;
};

/**
 * Parse time string to minutes since midnight
 */
export const timeToMinutes = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
};

/**
 * Convert minutes since midnight to time string
 */
export const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60) % 24;
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

/**
 * Check if time1 is before time2 (same day comparison)
 */
export const isTimeBefore = (time1: string, time2: string): boolean => {
    return timeToMinutes(time1) < timeToMinutes(time2);
};

/**
 * Check if time1 is after time2 (same day comparison)
 */
export const isTimeAfter = (time1: string, time2: string): boolean => {
    return timeToMinutes(time1) > timeToMinutes(time2);
};

/**
 * Parse time string to Date object for comparison
 */
export const getTimeAsDate = (date: Date, timeString: string): Date => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const result = new Date(date);
    result.setHours(hours, minutes, 0, 0);
    return result;
};

// ============================================
// Date Range Utilities
// ============================================

/**
 * Generate array of dates between start and end
 */
export const getDateRange = (startDate: Date, endDate: Date): Date[] => {
    const dates: Date[] = [];
    let currentDate = startOfDay(startDate);
    const end = endOfDay(endDate);

    while (isBefore(currentDate, end) || isSameDay(currentDate, end)) {
        dates.push(new Date(currentDate));
        currentDate = addDays(currentDate, 1);
    }

    return dates;
};

/**
 * Add days to a date
 */
export const addDaysToDate = (date: Date, days: number): Date => {
    return addDays(date, days);
};

/**
 * Add weeks to a date
 */
export const addWeeksToDate = (date: Date, weeks: number): Date => {
    return addWeeks(date, weeks);
};

/**
 * Add months to a date
 */
export const addMonthsToDate = (date: Date, months: number): Date => {
    return addMonths(date, months);
};

// ============================================
// Date String Parsing
// ============================================

/**
 * Parse date string to Date object
 */
export const parseDateString = (dateString: string): Date => {
    return new Date(dateString);
};

/**
 * Parse date string in YYYY-MM-DD format
 */
export const parseDateFromString = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
};

/**
 * Format date to YYYY-MM-DD string
 */
export const formatDateString = (date: Date): string => {
    return format(date, 'yyyy-MM-dd');
};

/**
 * Parse date and time strings to Date object
 */
export const parseDateTime = (dateString: string, timeString: string): Date => {
    const date = parseDateFromString(dateString);
    return getTimeAsDate(date, timeString);
};

// ============================================
// Week/Month Utilities
// ============================================

/**
 * Get day of week (0-6, Sunday-Saturday)
 */
export const getDayOfWeek = (date: Date): number => {
    return getDay(date);
};

/**
 * Get day of month (1-31)
 */
export const getDayOfMonth = (date: Date): number => {
    return getDate(date);
};

/**
 * Check if date is on a specific weekday
 */
export const isOnWeekday = (date: Date, weekdays: number[]): boolean => {
    return weekdays.includes(getDayOfWeek(date));
};

/**
 * Check if date is on a specific day of month
 */
export const isOnDayOfMonth = (date: Date, days: number[]): boolean => {
    return days.includes(getDayOfMonth(date));
};

// ============================================
// Date Comparison
// ============================================

/**
 * Check if date1 is same day as date2
 */
export const isSameDayDate = (date1: Date, date2: Date): boolean => {
    return isSameDay(date1, date2);
};

/**
 * Check if date1 is after date2 (date only)
 */
export const isDateAfter = (date1: Date, date2: Date): boolean => {
    const d1 = startOfDay(date1);
    const d2 = startOfDay(date2);
    return isAfter(d1, d2);
};

/**
 * Check if date1 is before date2 (date only)
 */
export const isDateBefore = (date1: Date, date2: Date): boolean => {
    const d1 = startOfDay(date1);
    const d2 = startOfDay(date2);
    return isBefore(d1, d2);
};

/**
 * Check if date is within range (inclusive)
 */
export const isDateInRange = (date: Date, startDate: Date, endDate: Date): boolean => {
    const d = startOfDay(date);
    const start = startOfDay(startDate);
    const end = endOfDay(endDate);
    return (isAfter(d, start) || isSameDay(d, start)) && (isBefore(d, end) || isSameDay(d, end));
};

// ============================================
// Time Slot Utilities
// ============================================

export interface TimeSlot {
    startTime: string;
    endTime: string;
}

/**
 * Check if two time slots overlap
 */
export const doTimeSlotsOverlap = (slot1: TimeSlot, slot2: TimeSlot): boolean => {
    const start1 = timeToMinutes(slot1.startTime);
    const end1 = timeToMinutes(slot1.endTime);
    const start2 = timeToMinutes(slot2.startTime);
    const end2 = timeToMinutes(slot2.endTime);

    return start1 < end2 && end1 > start2;
};

/**
 * Check if a time slot overlaps with any slot in an array
 */
export const doesTimeSlotOverlapArray = (
    slot: TimeSlot,
    slots: TimeSlot[]
): boolean => {
    return slots.some((existingSlot) => doTimeSlotsOverlap(slot, existingSlot));
};

/**
 * Get all time slots for a date range with recurrence
 */
export interface RecurrenceInstance {
    date: Date;
    startTime: string;
    endTime: string;
}

/**
 * Generate instances for daily recurrence
 */
export const generateDailyInstances = (
    startDate: Date,
    endDate: Date,
    timeSlots: TimeSlot[],
    interval: number = 1
): RecurrenceInstance[] => {
    const instances: RecurrenceInstance[] = [];
    let currentDate = startOfDay(startDate);
    const end = startOfDay(endDate);

    while (isBefore(currentDate, end) || isSameDay(currentDate, end)) {
        for (const slot of timeSlots) {
            instances.push({
                date: new Date(currentDate),
                startTime: slot.startTime,
                endTime: slot.endTime,
            });
        }
        currentDate = addDays(currentDate, interval);
    }

    return instances;
};

/**
 * Generate instances for weekly recurrence
 */
export const generateWeeklyInstances = (
    startDate: Date,
    endDate: Date,
    daysOfWeek: number[],
    timeSlots: TimeSlot[],
    interval: number = 1
): RecurrenceInstance[] => {
    const instances: RecurrenceInstance[] = [];
    let currentWeekStart = startOfDay(startDate);

    // Find the start of the week containing startDate
    const dayOfWeek = getDayOfWeek(currentWeekStart);
    currentWeekStart = addDays(currentWeekStart, -dayOfWeek);

    while (isBefore(currentWeekStart, endDate)) {
        for (const dayOfWeek of daysOfWeek) {
            const instanceDate = addDays(currentWeekStart, dayOfWeek);

            if (isDateInRange(instanceDate, startDate, endDate)) {
                for (const slot of timeSlots) {
                    instances.push({
                        date: new Date(instanceDate),
                        startTime: slot.startTime,
                        endTime: slot.endTime,
                    });
                }
            }
        }
        currentWeekStart = addWeeks(currentWeekStart, interval);
    }

    return instances;
};

/**
 * Generate instances for monthly recurrence
 */
export const generateMonthlyInstances = (
    startDate: Date,
    endDate: Date,
    daysOfMonth: number[],
    timeSlots: TimeSlot[],
    interval: number = 1
): RecurrenceInstance[] => {
    const instances: RecurrenceInstance[] = [];
    let currentMonth = startOfDay(startDate);
    currentMonth.setDate(1); // First day of month

    while (isBefore(currentMonth, endDate)) {
        for (const dayOfMonth of daysOfMonth) {
            const instanceDate = new Date(currentMonth);
            instanceDate.setDate(dayOfMonth);

            // Check if date is valid for this month
            if (instanceDate.getMonth() === currentMonth.getMonth() &&
                isDateInRange(instanceDate, startDate, endDate)) {
                for (const slot of timeSlots) {
                    instances.push({
                        date: new Date(instanceDate),
                        startTime: slot.startTime,
                        endTime: slot.endTime,
                    });
                }
            }
        }
        currentMonth = addMonths(currentMonth, interval);
    }

    return instances;
};
