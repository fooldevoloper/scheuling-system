import mongoose from 'mongoose';
import { Room, IRoom } from '../../models';
import { CreateRoomDTO, UpdateRoomDTO, PaginationParams, RoomListResponse } from './rooms.dto';

// ============================================
// Room Repository - Database Operations Only
// ============================================

export class RoomsRepository {
    /**
     * Create a new room
     */
    async create(data: CreateRoomDTO): Promise<IRoom> {
        const room = new Room({
            ...data,
            roomTypeId: new mongoose.Types.ObjectId(data.roomTypeId),
        });
        return room.save();
    }

    /**
     * Find room by ID
     */
    async findById(id: string): Promise<IRoom | null> {
        return Room.findById(id).populate('roomType');
    }

    /**
     * Update room
     */
    async update(id: string, data: UpdateRoomDTO): Promise<IRoom | null> {
        const updateData: any = { ...data };

        if (data.roomTypeId) {
            updateData.roomTypeId = new mongoose.Types.ObjectId(data.roomTypeId);
        }

        return Room.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        ).populate('roomType');
    }

    /**
     * Soft delete room
     */
    async softDelete(id: string): Promise<IRoom | null> {
        return Room.findByIdAndUpdate(
            id,
            { $set: { isActive: false } },
            { new: true }
        );
    }

    /**
     * Find all rooms with filters and pagination
     */
    async findAll(
        search?: string,
        roomTypeId?: string,
        pagination?: PaginationParams
    ): Promise<RoomListResponse> {
        const page = pagination?.page || 1;
        const limit = pagination?.limit || 10;
        const skip = (page - 1) * limit;

        const query: Record<string, any> = { isActive: true };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { building: { $regex: search, $options: 'i' } },
            ];
        }

        if (roomTypeId) {
            query.roomTypeId = new mongoose.Types.ObjectId(roomTypeId);
        }

        const total = await Room.countDocuments(query);
        const data = await Room.find(query)
            .populate('roomType')
            .sort({ name: 1 })
            .skip(skip)
            .limit(limit);

        return {
            data,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
}

export const roomsRepository = new RoomsRepository();
