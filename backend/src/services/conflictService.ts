import mongoose from 'mongoose';
import { Class, IClass, ClassInstance, DayOfWeek } from '../models';
import {
    timeToMinutes,
    isTimeBefore,
    isTimeAfter,
    getTimeAsDate,
    isDateInRange
} from '../utils/dateUtils';

// ============================================
// Conflict Detection Service
// ============================================

export interface ConflictResult {
    hasConflict: boolean;
    conflicts: ConflictInfo[];
}

export interface ConflictInfo {
    classId: string;
    className: string;
    date: Date;
    startTime: string;
    endTime: string;
    instructor?: string;
    room?: string;
    conflictType: 'instructor' | 'room';
}

export class ConflictDetector {
    /**
     * Check for instructor conflicts
     */
    async checkInstructorConflict(
        instructorId: string,
        date: Date,
        startTime: string,
        endTime: string,
        excludeClassId?: string
    ): Promise<ConflictResult> {
        const conflicts: ConflictInfo[] = [];

        // Find existing classes for this instructor
        const query: any = {
            instructorId: new mongoose.Types.ObjectId(instructorId),
            isActive: true,
            $or: [
                // Single class on the same date
                {
                    classType: 'single',
                    startDate: { $lte: date },
                    endDate: { $gte: date }
                },
                // Recurring class that spans the date
                {
                    classType: 'recurring',
                    'recurrence.endDate': { $gte: date }
                }
            ]
        };

        // Exclude current class if updating
        if (excludeClassId) {
            query._id = { $ne: new mongoose.Types.ObjectId(excludeClassId) };
        }

        const existingClasses = await Class.find(query);

        for (const cls of existingClasses) {
            const isConflict = this.checkTimeConflict(
                cls,
                date,
                startTime,
                endTime
            );

            if (isConflict) {
                conflicts.push({
                    classId: cls._id.toString(),
                    className: cls.name,
                    date: date,
                    startTime: cls.startTime,
                    endTime: cls.endTime,
                    conflictType: 'instructor'
                });
            }
        }

        // Also check class instances
        const instanceQuery: any = {
            instructorId: new mongoose.Types.ObjectId(instructorId),
            date: date,
            status: { $ne: 'cancelled' },
        };

        if (excludeClassId) {
            instanceQuery.parentClassId = { $ne: new mongoose.Types.ObjectId(excludeClassId) };
        }

        const instances = await ClassInstance.find(instanceQuery);

        for (const instance of instances) {
            if (this.timesOverlap(startTime, endTime, instance.startTime, instance.endTime)) {
                conflicts.push({
                    classId: instance.parentClassId.toString(),
                    className: 'Instance',
                    date: date,
                    startTime: instance.startTime,
                    endTime: instance.endTime,
                    conflictType: 'instructor'
                });
            }
        }

        return {
            hasConflict: conflicts.length > 0,
            conflicts
        };
    }

    /**
     * Check for room conflicts
     */
    async checkRoomConflict(
        roomId: string,
        date: Date,
        startTime: string,
        endTime: string,
        excludeClassId?: string
    ): Promise<ConflictResult> {
        const conflicts: ConflictInfo[] = [];

        // Find existing classes for this room
        const query: any = {
            roomId: new mongoose.Types.ObjectId(roomId),
            isActive: true,
            $or: [
                {
                    classType: 'single',
                    startDate: { $lte: date },
                    endDate: { $gte: date }
                },
                {
                    classType: 'recurring',
                    'recurrence.endDate': { $gte: date }
                }
            ]
        };

        if (excludeClassId) {
            query._id = { $ne: new mongoose.Types.ObjectId(excludeClassId) };
        }

        const existingClasses = await Class.find(query);

        for (const cls of existingClasses) {
            const isConflict = this.checkTimeConflict(
                cls,
                date,
                startTime,
                endTime
            );

            if (isConflict) {
                conflicts.push({
                    classId: cls._id.toString(),
                    className: cls.name,
                    date: date,
                    startTime: cls.startTime,
                    endTime: cls.endTime,
                    conflictType: 'room'
                });
            }
        }

        // Also check class instances
        const instanceQuery: any = {
            roomId: new mongoose.Types.ObjectId(roomId),
            date: date,
            status: { $ne: 'cancelled' },
        };

        if (excludeClassId) {
            instanceQuery.parentClassId = { $ne: new mongoose.Types.ObjectId(excludeClassId) };
        }

        const instances = await ClassInstance.find(instanceQuery);

        for (const instance of instances) {
            if (this.timesOverlap(startTime, endTime, instance.startTime, instance.endTime)) {
                conflicts.push({
                    classId: instance.parentClassId.toString(),
                    className: 'Instance',
                    date: date,
                    startTime: instance.startTime,
                    endTime: instance.endTime,
                    conflictType: 'room'
                });
            }
        }

        return {
            hasConflict: conflicts.length > 0,
            conflicts
        };
    }

    /**
     * Check for conflicts for a new class before creation
     */
    async checkClassConflicts(
        instructorId: string,
        roomId: string | undefined,
        date: Date,
        startTime: string,
        endTime: string
    ): Promise<ConflictResult[]> {
        const results: ConflictResult[] = [];

        // Check instructor conflict
        const instructorConflict = await this.checkInstructorConflict(
            instructorId,
            date,
            startTime,
            endTime
        );
        results.push(instructorConflict);

        // Check room conflict if room is specified
        if (roomId) {
            const roomConflict = await this.checkRoomConflict(
                roomId,
                date,
                startTime,
                endTime
            );
            results.push(roomConflict);
        }

        return results;
    }

    /**
     * Check time conflict for a recurring class
     */
    private checkTimeConflict(
        cls: IClass,
        targetDate: Date,
        targetStartTime: string,
        targetEndTime: string
    ): boolean {
        if (cls.classType === 'single') {
            // Single class on the same date
            if (!isDateInRange(targetDate, cls.startDate, cls.endDate || cls.startDate)) {
                return false;
            }
            return this.timesOverlap(
                targetStartTime,
                targetEndTime,
                cls.startTime,
                cls.endTime
            );
        } else if (cls.recurrence) {
            // Recurring class - check if target date matches recurrence
            const matchesRecurrence = this.dateMatchesRecurrence(
                targetDate,
                cls.recurrence
            );

            if (!matchesRecurrence) {
                return false;
            }

            // Check time slots
            if (cls.recurrence.timeSlots) {
                return cls.recurrence.timeSlots.some(slot =>
                    this.timesOverlap(
                        targetStartTime,
                        targetEndTime,
                        slot.startTime,
                        slot.endTime
                    )
                );
            }

            return this.timesOverlap(
                targetStartTime,
                targetEndTime,
                cls.startTime,
                cls.endTime
            );
        }

        return false;
    }

    /**
     * Check if a date matches the recurrence pattern
     */
    private dateMatchesRecurrence(
        date: Date,
        recurrence: IClass['recurrence']
    ): boolean {
        if (!recurrence) return false;

        switch (recurrence.pattern) {
            case 'daily':
                // Daily always matches if within date range
                return true;

            case 'weekly':
                if (recurrence.daysOfWeek) {
                    const dayOfWeek = date.getDay() as DayOfWeek;
                    return recurrence.daysOfWeek.includes(dayOfWeek);
                }
                return false;

            case 'monthly':
                if (recurrence.dayOfMonth) {
                    const dayOfMonth = date.getDate();
                    return recurrence.dayOfMonth.includes(dayOfMonth);
                }
                return false;

            case 'custom':
                // Custom rules would be handled by RRule
                return true;

            default:
                return false;
        }
    }

    /**
     * Check if two time ranges overlap
     */
    private timesOverlap(
        start1: string,
        end1: string,
        start2: string,
        end2: string
    ): boolean {
        const start1Min = timeToMinutes(start1);
        const end1Min = timeToMinutes(end1);
        const start2Min = timeToMinutes(start2);
        const end2Min = timeToMinutes(end2);

        return start1Min < end2Min && end1Min > start2Min;
    }
}

// Export singleton instance
export const conflictDetector = new ConflictDetector();
