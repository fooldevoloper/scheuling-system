import { Router } from 'express';
import { roomsController } from './rooms.controller';

const router = Router();

// ============================================
// Room Routes
// ============================================

/**
 * GET /api/rooms
 * Get all rooms with pagination and filters
 */
router.get('/', roomsController.getRooms.bind(roomsController));

/**
 * GET /api/rooms/:id
 * Get single room by ID
 */
router.get('/:id', roomsController.getRoomById.bind(roomsController));

/**
 * POST /api/rooms
 * Create a new room
 */
router.post('/', roomsController.createRoom.bind(roomsController));

/**
 * PUT /api/rooms/:id
 * Update a room
 */
router.put('/:id', roomsController.updateRoom.bind(roomsController));

/**
 * DELETE /api/rooms/:id
 * Delete (soft) a room
 */
router.delete('/:id', roomsController.deleteRoom.bind(roomsController));

export default router;
