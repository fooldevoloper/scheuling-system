import { Router } from 'express';
import { instructorsController } from './instructors.controller';

const router = Router();

// ============================================
// Instructor Routes
// ============================================

/**
 * GET /api/instructors
 * Get all instructors with pagination and filters
 */
router.get('/', instructorsController.getInstructors.bind(instructorsController));

/**
 * GET /api/instructors/:id
 * Get single instructor by ID
 */
router.get('/:id', instructorsController.getInstructorById.bind(instructorsController));

/**
 * POST /api/instructors
 * Create a new instructor
 */
router.post('/', instructorsController.createInstructor.bind(instructorsController));

/**
 * PUT /api/instructors/:id
 * Update an instructor
 */
router.put('/:id', instructorsController.updateInstructor.bind(instructorsController));

/**
 * DELETE /api/instructors/:id
 * Delete (soft) an instructor
 */
router.delete('/:id', instructorsController.deleteInstructor.bind(instructorsController));

export default router;
