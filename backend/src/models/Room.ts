import mongoose, { Document, Schema, Types } from 'mongoose';
import { IRoomType } from './RoomType';

export interface IRoom extends Document {
    name: string;
    roomTypeId: Types.ObjectId;
    building?: string;
    floor?: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    roomType?: IRoomType;
}

const RoomSchema = new Schema<IRoom>(
    {
        name: {
            type: String,
            required: [true, 'Room name is required'],
            trim: true,
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        roomTypeId: {
            type: Schema.Types.ObjectId,
            ref: 'RoomType',
            required: [true, 'Room type is required'],
        },
        building: {
            type: String,
            trim: true,
            maxlength: [100, 'Building name cannot exceed 100 characters'],
        },
        floor: {
            type: Number,
            min: [0, 'Floor cannot be negative'],
            max: [200, 'Floor number seems invalid'],
        },
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
RoomSchema.index({ name: 'text', building: 'text' });
RoomSchema.index({ isActive: 1 });
RoomSchema.index({ roomTypeId: 1 });
RoomSchema.index({ building: 1, floor: 1 });

// Virtual for room type
RoomSchema.virtual('roomType', {
    ref: 'RoomType',
    localField: 'roomTypeId',
    foreignField: '_id',
    justOne: true,
});

export const Room = mongoose.model<IRoom>('Room', RoomSchema);
