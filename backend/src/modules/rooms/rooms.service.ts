import { roomsRepository } from './rooms.repository';
import { cacheService } from '../cache';
import { CreateRoomDTO, UpdateRoomDTO, PaginationParams, RoomListResponse } from './rooms.dto';
import { IRoom } from '../../models';

// ============================================
// Room Service - Business Logic
// ============================================

export class RoomsService {
    /**
     * Find all rooms with pagination and filters
     */
    async findAll(
        search?: string,
        roomTypeId?: string,
        pagination?: PaginationParams
    ): Promise<RoomListResponse> {
        const page = pagination?.page || 1;
        const limit = pagination?.limit || 10;

        // Generate cache key
        const cacheKey = `rooms:${page}:${limit}:${search || 'all'}:${roomTypeId || 'all'}`;

        // Try cache first
        const cached = await cacheService.get<RoomListResponse>(cacheKey);
        if (cached) {
            return cached;
        }

        // Fetch from database
        const result = await roomsRepository.findAll(search, roomTypeId, { page, limit });

        // Only cache if there's data
        if (result.data && result.data.length > 0) {
            await cacheService.set(cacheKey, result);
        }

        return result;
    }

    /**
     * Find room by ID
     */
    async findById(id: string): Promise<IRoom | null> {
        // Try cache first
        const cacheKey = `room:${id}`;
        const cached = await cacheService.get<IRoom>(cacheKey);
        if (cached) {
            return cached;
        }

        const room = await roomsRepository.findById(id);

        if (room) {
            await cacheService.set(cacheKey, room);
        }

        return room;
    }

    /**
     * Create a new room
     */
    async create(data: CreateRoomDTO): Promise<IRoom> {
        const newRoom = await roomsRepository.create(data);

        // Invalidate cache
        await cacheService.deleteByPattern('rooms*');
        await cacheService.deleteByPattern('roomtypes*');
        await cacheService.invalidateClasses();

        return newRoom;
    }

    /**
     * Update a room
     */
    async update(id: string, data: UpdateRoomDTO): Promise<IRoom | null> {
        const updatedRoom = await roomsRepository.update(id, data);

        if (!updatedRoom) {
            return null;
        }

        // Invalidate cache
        await cacheService.deleteByPattern('rooms*');
        await cacheService.deleteByPattern('roomtypes*');
        await cacheService.invalidateClasses();

        return updatedRoom;
    }

    /**
     * Delete (soft) a room
     */
    async delete(id: string): Promise<IRoom | null> {
        const deletedRoom = await roomsRepository.softDelete(id);

        if (!deletedRoom) {
            return null;
        }

        // Invalidate cache
        await cacheService.deleteByPattern('rooms*');
        await cacheService.deleteByPattern('roomtypes*');
        await cacheService.invalidateClasses();

        return deletedRoom;
    }
}

export const roomsService = new RoomsService();
