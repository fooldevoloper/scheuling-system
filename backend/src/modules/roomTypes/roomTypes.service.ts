import { roomTypesRepository } from './roomTypes.repository';
import { cacheService } from '../cache';
import { CreateRoomTypeDTO, UpdateRoomTypeDTO, PaginationParams, RoomTypeListResponse } from './roomTypes.dto';
import { IRoomType } from '../../models';

// ============================================
// RoomType Service - Business Logic
// ============================================

export class RoomTypesService {
    /**
     * Find all room types with pagination and filters
     */
    async findAll(search?: string, pagination?: PaginationParams): Promise<RoomTypeListResponse> {
        const page = pagination?.page || 1;
        const limit = pagination?.limit || 10;

        // Generate cache key
        const cacheKey = `roomtypes:${page}:${limit}:${search || 'all'}`;

        // Try cache first
        const cached = await cacheService.get<RoomTypeListResponse>(cacheKey);
        if (cached) {
            return cached;
        }

        // Fetch from database
        const result = await roomTypesRepository.findAll(search, { page, limit });

        // Only cache if there's data
        if (result.data && result.data.length > 0) {
            await cacheService.set(cacheKey, result);
        }

        return result;
    }

    /**
     * Find room type by ID
     */
    async findById(id: string): Promise<IRoomType | null> {
        // Try cache first
        const cacheKey = `roomtype:${id}`;
        const cached = await cacheService.get<IRoomType>(cacheKey);
        if (cached) {
            return cached;
        }

        const roomType = await roomTypesRepository.findById(id);

        if (roomType) {
            await cacheService.set(cacheKey, roomType);
        }

        return roomType;
    }

    /**
     * Create a new room type
     */
    async create(data: CreateRoomTypeDTO): Promise<IRoomType> {
        const newRoomType = await roomTypesRepository.create(data);

        // Invalidate cache
        await cacheService.deleteByPattern('roomtypes*');
        await cacheService.invalidateClasses();
        await cacheService.invalidateCalendar();

        return newRoomType;
    }

    /**
     * Update a room type
     */
    async update(id: string, data: UpdateRoomTypeDTO): Promise<IRoomType | null> {
        const updatedRoomType = await roomTypesRepository.update(id, data);

        if (!updatedRoomType) {
            return null;
        }

        // Invalidate cache
        await cacheService.deleteByPattern('roomtypes*');
        await cacheService.deleteByPattern('rooms*');
        await cacheService.invalidateClasses();
        await cacheService.invalidateCalendar();

        return updatedRoomType;
    }

    /**
     * Delete (soft) a room type
     */
    async delete(id: string): Promise<IRoomType | null> {
        const deletedRoomType = await roomTypesRepository.softDelete(id);

        if (!deletedRoomType) {
            return null;
        }

        // Invalidate cache
        await cacheService.deleteByPattern('roomtypes*');
        await cacheService.deleteByPattern('rooms*');
        await cacheService.invalidateClasses();
        await cacheService.invalidateCalendar();

        return deletedRoomType;
    }
}

export const roomTypesService = new RoomTypesService();
