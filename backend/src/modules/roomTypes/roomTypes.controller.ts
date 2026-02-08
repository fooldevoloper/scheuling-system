import { Request, Response, NextFunction } from 'express';
import { roomTypesService } from './roomTypes.service';
import { CreateRoomTypeDTO, UpdateRoomTypeDTO } from './roomTypes.dto';
import { sendCreated, sendOk, sendNotFoundError } from '../../shared/utils/responseFormatter';

// ============================================
// RoomType Controller - HTTP Layer Only
// ============================================

export class RoomTypesController {
    /**
     * GET /api/room-types
     * Get all room types with pagination and filters
     */
    async getRoomTypes(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string;

            const result = await roomTypesService.findAll(search, { page, limit });
            sendOk(res, 'Room Types Fetched', 'Room types loaded', result);
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

            const roomType = await roomTypesService.findById(id);

            if (!roomType) {
                sendNotFoundError(res, 'Room Type', id);
                return;
            }

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

            const newRoomType = await roomTypesService.create(roomTypeData);
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

            const updatedRoomType = await roomTypesService.update(id, updateData);

            if (!updatedRoomType) {
                sendNotFoundError(res, 'Room Type', id);
                return;
            }

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

            const deletedRoomType = await roomTypesService.delete(id);

            if (!deletedRoomType) {
                sendNotFoundError(res, 'Room Type', id);
                return;
            }

            sendOk(res, 'Room Type Deleted', 'Room type deleted successfully', deletedRoomType);
        } catch (error) {
            next(error);
        }
    }
}

export const roomTypesController = new RoomTypesController();
