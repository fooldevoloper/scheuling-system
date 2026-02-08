import { Request, Response, NextFunction } from 'express';
import { roomsService } from './rooms.service';
import { CreateRoomDTO, UpdateRoomDTO } from './rooms.dto';
import { sendCreated, sendOk, sendNotFoundError } from '../../shared/utils/responseFormatter';

// ============================================
// Room Controller - HTTP Layer Only
// ============================================

export class RoomsController {
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

            const result = await roomsService.findAll(search, roomTypeId, { page, limit });
            sendOk(res, 'Rooms Fetched', 'Rooms loaded', result);
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

            const room = await roomsService.findById(id);

            if (!room) {
                sendNotFoundError(res, 'Room', id);
                return;
            }

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

            const newRoom = await roomsService.create(roomData);
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

            const updatedRoom = await roomsService.update(id, updateData);

            if (!updatedRoom) {
                sendNotFoundError(res, 'Room', id);
                return;
            }

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

            const deletedRoom = await roomsService.delete(id);

            if (!deletedRoom) {
                sendNotFoundError(res, 'Room', id);
                return;
            }

            sendOk(res, 'Room Deleted', 'Room deleted successfully', deletedRoom);
        } catch (error) {
            next(error);
        }
    }
}

export const roomsController = new RoomsController();
