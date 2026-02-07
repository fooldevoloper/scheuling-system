import mongoose, { Document, Schema, Types } from 'mongoose';
import { IClass } from './Class';
import { IInstructor } from './Instructor';
import { IRoom } from './Room';

export type InstanceStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';

export interface IClassInstance extends Document {
    parentClassId: Types.ObjectId;
    date: Date;
    startTime: string;
    endTime: string;
    instructorId: Types.ObjectId;
    roomId?: Types.ObjectId;
    status: InstanceStatus;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;

    // Virtuals
    parentClass?: IClass;
    instructor?: IInstructor;
    room?: IRoom;
}

const ClassInstanceSchema = new Schema<IClassInstance>(
    {
        parentClassId: {
            type: Schema.Types.ObjectId,
            ref: 'Class',
            required: [true, 'Parent class ID is required'],
        },
        date: {
            type: Date,
            required: [true, 'Date is required'],
        },
        startTime: {
            type: String,
            required: [true, 'Start time is required'],
            match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'],
        },
        endTime: {
            type: String,
            required: [true, 'End time is required'],
            match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'],
        },
        instructorId: {
            type: Schema.Types.ObjectId,
            ref: 'Instructor',
            required: [true, 'Instructor is required'],
        },
        roomId: {
            type: Schema.Types.ObjectId,
            ref: 'Room',
        },
        status: {
            type: String,
            enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
            default: 'scheduled',
        },
        notes: {
            type: String,
            trim: true,
            maxlength: [1000, 'Notes cannot exceed 1000 characters'],
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Indexes
ClassInstanceSchema.index({ parentClassId: 1 });
ClassInstanceSchema.index({ date: 1 });
ClassInstanceSchema.index({ instructorId: 1, date: 1 });
ClassInstanceSchema.index({ roomId: 1, date: 1 });
ClassInstanceSchema.index({ status: 1 });
ClassInstanceSchema.index({ date: 1, startTime: 1, endTime: 1 });

// Compound indexes for conflict detection
ClassInstanceSchema.index({ instructorId: 1, date: 1, startTime: 1, endTime: 1 });
ClassInstanceSchema.index({ roomId: 1, date: 1, startTime: 1, endTime: 1 });

// Virtuals
ClassInstanceSchema.virtual('parentClass', {
    ref: 'Class',
    localField: 'parentClassId',
    foreignField: '_id',
    justOne: true,
});

ClassInstanceSchema.virtual('instructor', {
    ref: 'Instructor',
    localField: 'instructorId',
    foreignField: '_id',
    justOne: true,
});

ClassInstanceSchema.virtual('room', {
    ref: 'Room',
    localField: 'roomId',
    foreignField: '_id',
    justOne: true,
});

// Pre-save validation
ClassInstanceSchema.pre('save', function (next) {
    // Parse time strings to compare
    const startParts = this.startTime.split(':').map(Number);
    const endParts = this.endTime.split(':').map(Number);

    const startMinutes = startParts[0] * 60 + startParts[1];
    const endMinutes = endParts[0] * 60 + endParts[1];

    if (startMinutes >= endMinutes) {
        return next(new Error('End time must be after start time'));
    }

    next();
});

export const ClassInstance = mongoose.model<IClassInstance>('ClassInstance', ClassInstanceSchema);
