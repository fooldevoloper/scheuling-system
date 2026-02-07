import { Router } from 'express';
import { roomTypeController } from '../controllers';

const router = Router();

// ============================================
// Room Type Routes
// ============================================

/**
 * GET /api/room-types
 * Get all room types with pagination and filters
 */
router.get('/', roomTypeController.getRoomTypes.bind(roomTypeController));

/**
 * GET /api/room-types/:id
 * Get single room type by ID
 */
router.get('/:id', roomTypeController.getRoomTypeById.bind(roomTypeController));

/**
 * POST /api/room-types
 * Create a new room type
 */
router.post('/', roomTypeController.createRoomType.bind(roomTypeController));

/**
 * PUT /api/room-types/:id
 * Update a room type
 */
router.put('/:id', roomTypeController.updateRoomType.bind(roomTypeController));

/**
 * DELETE /api/room-types/:id
 * Delete (soft) a room type
 */
router.delete('/:id', roomTypeController.deleteRoomType.bind(roomTypeController));

export default router;
