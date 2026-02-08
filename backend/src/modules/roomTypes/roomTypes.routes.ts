import { Router } from 'express';
import { roomTypesController } from './roomTypes.controller';

const router = Router();

// ============================================
// RoomType Routes
// ============================================

/**
 * GET /api/room-types
 * Get all room types with pagination and filters
 */
router.get('/', roomTypesController.getRoomTypes.bind(roomTypesController));

/**
 * GET /api/room-types/:id
 * Get single room type by ID
 */
router.get('/:id', roomTypesController.getRoomTypeById.bind(roomTypesController));

/**
 * POST /api/room-types
 * Create a new room type
 */
router.post('/', roomTypesController.createRoomType.bind(roomTypesController));

/**
 * PUT /api/room-types/:id
 * Update a room type
 */
router.put('/:id', roomTypesController.updateRoomType.bind(roomTypesController));

/**
 * DELETE /api/room-types/:id
 * Delete (soft) a room type
 */
router.delete('/:id', roomTypesController.deleteRoomType.bind(roomTypesController));

export default router;
