import mongoose, { Document, Schema } from 'mongoose';

export interface IRoomType extends Document {
    name: string;
    capacity: number;
    description?: string;
    amenities: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const RoomTypeSchema = new Schema<IRoomType>(
    {
        name: {
            type: String,
            required: [true, 'Room type name is required'],
            trim: true,
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        capacity: {
            type: Number,
            required: [true, 'Capacity is required'],
            min: [1, 'Capacity must be at least 1'],
            max: [10000, 'Capacity cannot exceed 10000'],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'Description cannot exceed 500 characters'],
        },
        amenities: [{
            type: String,
            trim: true,
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
RoomTypeSchema.index({ name: 'text', description: 'text' });
RoomTypeSchema.index({ isActive: 1 });
RoomTypeSchema.index({ capacity: 1 });

// Virtual for room count
RoomTypeSchema.virtual('roomCount', {
    ref: 'Room',
    localField: '_id',
    foreignField: 'roomTypeId',
    count: true,
});

export const RoomType = mongoose.model<IRoomType>('RoomType', RoomTypeSchema);
