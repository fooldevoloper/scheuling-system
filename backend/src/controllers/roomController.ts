import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Room, IRoom } from '../models';
import { sendCreated, sendOk, sendNotFoundError } from '../utils/responseFormatter';
import { CreateRoomDTO, UpdateRoomDTO } from '../types';
import { cacheService } from '../services/cacheService';

// ============================================
// Room Controller
// ============================================

export class RoomController {
    /**
     * GET /api/rooms
     * Get all rooms with pagination and filters
     */
    async getRooms(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string;
            const roomTypeId = req.query.roomTypeId as string;

            // Generate cache key
            const cacheKey = `rooms:${page}:${limit}:${search || 'all'}:${roomTypeId || 'all'}`;

            // Try cache first
            const cached = await cacheService.get(cacheKey);
            if (cached) {
                sendOk(res, 'Rooms Fetched', 'Rooms loaded from cache', cached);
                return;
            }

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

            const skip = (page - 1) * limit;
            const total = await Room.countDocuments(query);
            const rooms = await Room.find(query)
                .populate('roomType')
                .sort({ name: 1 })
                .skip(skip)
                .limit(limit);

            const response = {
                data: rooms,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            };

            // Cache the response
            await cacheService.set(cacheKey, response);

            sendOk(res, 'Rooms Fetched', 'Rooms loaded', response);
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/rooms/:id
     * Get single room by ID
     */
    async getRoomById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            // Try cache first
            const cacheKey = `room:${id}`;
            const cached = await cacheService.get(cacheKey);
            if (cached) {
                sendOk(res, 'Room Found', 'Room details loaded from cache', cached);
                return;
            }

            const room = await Room.findById(id).populate('roomType');

            if (!room) {
                sendNotFoundError(res, 'Room', id);
                return;
            }

            // Cache the response
            await cacheService.set(cacheKey, room);

            sendOk(res, 'Room Found', 'Room details loaded', room);
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/rooms
     * Create a new room
     */
    async createRoom(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const roomData = req.body as CreateRoomDTO;

            const newRoom = new Room({
                ...roomData,
                roomTypeId: new mongoose.Types.ObjectId(roomData.roomTypeId),
            });

            await newRoom.save();

            // Invalidate cache
            await cacheService.deleteByPattern('rooms*');

            sendCreated(res, 'Room Created', 'New room created successfully', newRoom);
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/rooms/:id
     * Update a room
     */
    async updateRoom(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const updateData = req.body as UpdateRoomDTO;

            if (updateData.roomTypeId) {
                updateData.roomTypeId = new mongoose.Types.ObjectId(updateData.roomTypeId as string) as any;
            }

            const updatedRoom = await Room.findByIdAndUpdate(
                id,
                { $set: updateData },
                { new: true }
            ).populate('roomType');

            if (!updatedRoom) {
                sendNotFoundError(res, 'Room', id);
                return;
            }

            // Invalidate cache
            await cacheService.delete(`room:${id}`);
            await cacheService.deleteByPattern('rooms*');

            sendOk(res, 'Room Updated', 'Room updated successfully', updatedRoom);
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/rooms/:id
     * Delete (soft) a room
     */
    async deleteRoom(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const deletedRoom = await Room.findByIdAndUpdate(
                id,
                { $set: { isActive: false } },
                { new: true }
            );

            if (!deletedRoom) {
                sendNotFoundError(res, 'Room', id);
                return;
            }

            // Invalidate cache
            await cacheService.delete(`room:${id}`);
            await cacheService.deleteByPattern('rooms*');

            sendOk(res, 'Room Deleted', 'Room deleted successfully', deletedRoom);
        } catch (error) {
            next(error);
        }
    }
}

// Export singleton instance
export const roomController = new RoomController();
