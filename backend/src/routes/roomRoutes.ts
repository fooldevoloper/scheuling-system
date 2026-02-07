import { Router } from 'express';
import { roomController } from '../controllers';

const router = Router();

// ============================================
// Room Routes
// ============================================

/**
 * GET /api/rooms
 * Get all rooms with pagination and filters
 */
router.get('/', roomController.getRooms.bind(roomController));

/**
 * GET /api/rooms/:id
 * Get single room by ID
 */
router.get('/:id', roomController.getRoomById.bind(roomController));

/**
 * POST /api/rooms
 * Create a new room
 */
router.post('/', roomController.createRoom.bind(roomController));

/**
 * PUT /api/rooms/:id
 * Update a room
 */
router.put('/:id', roomController.updateRoom.bind(roomController));

/**
 * DELETE /api/rooms/:id
 * Delete (soft) a room
 */
router.delete('/:id', roomController.deleteRoom.bind(roomController));

export default router;
