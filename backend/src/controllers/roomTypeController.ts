import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { RoomType, IRoomType } from '../models';
import { sendCreated, sendOk, sendNotFoundError } from '../utils/responseFormatter';
import { CreateRoomTypeDTO, UpdateRoomTypeDTO, PaginationParams } from '../types';
import { cacheService } from '../services/cacheService';

// ============================================
// Room Type Controller
// ============================================

export class RoomTypeController {
    /**
     * GET /api/room-types
     * Get all room types with pagination and filters
     */
    async getRoomTypes(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string;

            // Generate cache key
            const cacheKey = `roomtypes:${page}:${limit}:${search || 'all'}`;

            // Try cache first
            const cached = await cacheService.get(cacheKey);
            if (cached) {
                sendOk(res, 'Room Types Fetched', 'Room types loaded from cache', cached);
                return;
            }

            const query: Record<string, any> = { isActive: true };

            if (search) {
                query.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } },
                ];
            }

            const skip = (page - 1) * limit;
            const total = await RoomType.countDocuments(query);
            const roomTypes = await RoomType.find(query)
                .sort({ name: 1 })
                .skip(skip)
                .limit(limit);

            const response = {
                data: roomTypes,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            };

            // Only cache if there's data
            if (roomTypes && roomTypes.length > 0) {
                await cacheService.set(cacheKey, response);
            }

            sendOk(res, 'Room Types Fetched', 'Room types loaded', response);
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/room-types/:id
     * Get single room type by ID
     */
    async getRoomTypeById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            // Try cache first
            const cacheKey = `roomtype:${id}`;
            const cached = await cacheService.get(cacheKey);
            if (cached) {
                sendOk(res, 'Room Type Found', 'Room type details loaded from cache', cached);
                return;
            }

            const roomType = await RoomType.findById(id);

            if (!roomType) {
                sendNotFoundError(res, 'Room Type', id);
                return;
            }

            // Cache the response
            await cacheService.set(cacheKey, roomType);

            sendOk(res, 'Room Type Found', 'Room type details loaded', roomType);
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/room-types
     * Create a new room type
     */
    async createRoomType(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const roomTypeData = req.body as CreateRoomTypeDTO;

            const newRoomType = new RoomType({
                ...roomTypeData,
                amenities: roomTypeData.amenities || [],
            });
            await newRoomType.save();

            // Invalidate cache
            await cacheService.deleteByPattern('roomtypes*');
            await cacheService.invalidateClasses();

            sendCreated(res, 'Room Type Created', 'New room type created successfully', newRoomType);
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/room-types/:id
     * Update a room type
     */
    async updateRoomType(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const updateData = req.body as UpdateRoomTypeDTO;

            const updatedRoomType = await RoomType.findByIdAndUpdate(
                id,
                { $set: updateData },
                { new: true }
            );

            if (!updatedRoomType) {
                sendNotFoundError(res, 'Room Type', id);
                return;
            }

            // Invalidate cache
            await cacheService.invalidateRoomType(id);

            sendOk(res, 'Room Type Updated', 'Room type updated successfully', updatedRoomType);
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/room-types/:id
     * Delete (soft) a room type
     */
    async deleteRoomType(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const deletedRoomType = await RoomType.findByIdAndUpdate(
                id,
                { $set: { isActive: false } },
                { new: true }
            );

            if (!deletedRoomType) {
                sendNotFoundError(res, 'Room Type', id);
                return;
            }

            // Invalidate cache
            await cacheService.invalidateRoomType(id);

            sendOk(res, 'Room Type Deleted', 'Room type deleted successfully', deletedRoomType);
        } catch (error) {
            next(error);
        }
    }
}

// Export singleton instance
export const roomTypeController = new RoomTypeController();
