import { Router } from 'express';
import { instructorController } from '../controllers';

const router = Router();

// ============================================
// Instructor Routes
// ============================================

/**
 * GET /api/instructors
 * Get all instructors with pagination and filters
 */
router.get('/', instructorController.getInstructors.bind(instructorController));

/**
 * GET /api/instructors/:id
 * Get single instructor by ID
 */
router.get('/:id', instructorController.getInstructorById.bind(instructorController));

/**
 * POST /api/instructors
 * Create a new instructor
 */
router.post('/', instructorController.createInstructor.bind(instructorController));

/**
 * PUT /api/instructors/:id
 * Update an instructor
 */
router.put('/:id', instructorController.updateInstructor.bind(instructorController));

/**
 * DELETE /api/instructors/:id
 * Delete (soft) an instructor
 */
router.delete('/:id', instructorController.deleteInstructor.bind(instructorController));

export default router;
