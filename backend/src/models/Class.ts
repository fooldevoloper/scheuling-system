import mongoose, { Document, Schema, Types } from 'mongoose';
import { IRoomType } from './RoomType';
import { IInstructor } from './Instructor';
import { IRoom } from './Room';

export type ClassType = 'single' | 'recurring';
export type RecurrencePattern = 'daily' | 'weekly' | 'monthly' | 'custom';
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

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
    exclusionDates?: string[]; // Specific dates to exclude (YYYY-MM-DD format)
    excludeWeekends?: boolean; // Whether to exclude Saturdays and Sundays
}

export interface GeneratedInstance {
    instanceId: Types.ObjectId;
    date: Date;
    startTime: string;
    endTime: string;
    status: 'scheduled' | 'completed' | 'cancelled';
}

export interface IClass extends Document {
    name: string;
    description?: string;
    courseCode?: string;
    instructorId: Types.ObjectId;
    roomTypeId: Types.ObjectId;
    roomId?: Types.ObjectId;
    classType: ClassType;

    // Single class specific
    startDate: Date;
    endDate?: Date;
    startTime: string;
    endTime: string;

    // Recurring class specific
    recurrence?: RecurrenceConfig;
    generatedInstances?: GeneratedInstance[];

    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;

    // Virtuals
    instructor?: IInstructor;
    roomType?: IRoomType;
    room?: IRoom;
}

const ClassSchema = new Schema<IClass>(
    {
        name: {
            type: String,
            required: [true, 'Class name is required'],
            trim: true,
            maxlength: [200, 'Class name cannot exceed 200 characters'],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [2000, 'Description cannot exceed 2000 characters'],
        },
        courseCode: {
            type: String,
            trim: true,
            maxlength: [50, 'Course code cannot exceed 50 characters'],
        },
        instructorId: {
            type: Schema.Types.ObjectId,
            ref: 'Instructor',
            required: [true, 'Instructor is required'],
        },
        roomTypeId: {
            type: Schema.Types.ObjectId,
            ref: 'RoomType',
            required: [true, 'Room type is required'],
        },
        roomId: {
            type: Schema.Types.ObjectId,
            ref: 'Room',
        },
        classType: {
            type: String,
            enum: ['single', 'recurring'],
            required: [true, 'Class type is required'],
        },

        // Single class fields
        startDate: {
            type: Date,
            required: function (): boolean {
                return this.classType === 'single';
            },
        },
        endDate: {
            type: Date,
        },
        startTime: {
            type: String,
            required: true,
            match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'],
        },
        endTime: {
            type: String,
            required: true,
            match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'],
        },

        // Recurring class fields
        recurrence: {
            pattern: {
                type: String,
                enum: ['daily', 'weekly', 'monthly', 'custom'],
            },
            daysOfWeek: [{
                type: Number,
                min: 0,
                max: 6,
            }],
            dayOfMonth: [{
                type: Number,
                min: 1,
                max: 31,
            }],
            interval: {
                type: Number,
                min: 1,
                default: 1,
            },
            timeSlots: [{
                startTime: {
                    type: String,
                    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'],
                },
                endTime: {
                    type: String,
                    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'],
                },
            }],
            endDate: {
                type: Date,
            },
            occurrences: {
                type: Number,
                min: 1,
            },
            customRules: {
                type: String,
            },
            exclusionDates: [{
                type: String,
                match: [/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'],
            }],
            excludeWeekends: {
                type: Boolean,
                default: false,
            },
        },

        generatedInstances: [{
            instanceId: {
                type: Schema.Types.ObjectId,
                ref: 'ClassInstance',
            },
            date: Date,
            startTime: String,
            endTime: String,
            status: {
                type: String,
                enum: ['scheduled', 'completed', 'cancelled'],
                default: 'scheduled',
            },
        }],

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes
ClassSchema.index({ name: 'text', courseCode: 'text', description: 'text' });
ClassSchema.index({ classType: 1, isActive: 1 });
ClassSchema.index({ 'recurrence.pattern': 1 });
ClassSchema.index({ startDate: 1, endDate: 1 });
ClassSchema.index({ instructorId: 1, isActive: 1 });
ClassSchema.index({ roomTypeId: 1, isActive: 1 });
ClassSchema.index({ roomId: 1, isActive: 1 });
ClassSchema.index({ 'recurrence.endDate': 1 });

// Virtuals
ClassSchema.virtual('instructor', {
    ref: 'Instructor',
    localField: 'instructorId',
    foreignField: '_id',
    justOne: true,
});

ClassSchema.virtual('roomType', {
    ref: 'RoomType',
    localField: 'roomTypeId',
    foreignField: '_id',
    justOne: true,
});

ClassSchema.virtual('room', {
    ref: 'Room',
    localField: 'roomId',
    foreignField: '_id',
    justOne: true,
});

// Pre-save validation
ClassSchema.pre('save', function (next) {
    // Validate single class has startDate
    if (this.classType === 'single' && !this.startDate) {
        return next(new Error('Start date is required for single class'));
    }

    // Validate recurring class has recurrence config
    if (this.classType === 'recurring' && (!this.recurrence || !this.recurrence.pattern)) {
        return next(new Error('Recurrence config is required for recurring class'));
    }

    // Validate time slots for recurring class
    if (this.classType === 'recurring' && this.recurrence?.timeSlots) {
        for (const slot of this.recurrence.timeSlots) {
            if (slot.startTime >= slot.endTime) {
                return next(new Error('End time must be after start time'));
            }
        }
    }

    // Validate single class time
    if (this.classType === 'single' && this.startTime >= this.endTime) {
        return next(new Error('End time must be after start time'));
    }

    next();
});

export const Class = mongoose.model<IClass>('Class', ClassSchema);
