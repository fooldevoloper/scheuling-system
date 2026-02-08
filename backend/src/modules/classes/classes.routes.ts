import { Router } from 'express';
import { classesController } from './classes.controller';

const router = Router();

// ============================================
// Class Routes
// ============================================

/**
 * GET /api/classes
 * Get all classes with pagination and filters
 */
router.get('/', classesController.getClasses.bind(classesController));

/**
 * GET /api/classes/calendar
 * Get calendar view data
 */
router.get('/calendar', classesController.getCalendar.bind(classesController));

/**
 * GET /api/classes/:id
 * Get single class by ID
 */
router.get('/:id', classesController.getClassById.bind(classesController));

/**
 * POST /api/classes
 * Create a new class
 */
router.post('/', classesController.createClass.bind(classesController));

/**
 * PUT /api/classes/:id
 * Update a class
 */
router.put('/:id', classesController.updateClass.bind(classesController));

/**
 * DELETE /api/classes/:id
 * Delete (soft) a class
 */
router.delete('/:id', classesController.deleteClass.bind(classesController));

/**
 * POST /api/classes/:id/generate-instances
 * Generate instances for a recurring class
 */
router.post('/:id/generate-instances', classesController.generateInstances.bind(classesController));

/**
 * PATCH /api/classes/:id/status
 * Update class status
 */
router.patch('/:id/status', classesController.updateStatus.bind(classesController));

export default router;
