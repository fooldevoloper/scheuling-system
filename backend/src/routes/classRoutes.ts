import { Router } from 'express';
import { classController } from '../controllers';
import { validate, classValidationRules } from '../middleware';

const router = Router();

// ============================================
// Class Routes
// ============================================

/**
 * GET /api/classes
 * Get all classes with pagination and filters
 */
router.get('/', classController.getClasses.bind(classController));

/**
 * GET /api/classes/calendar
 * Get calendar view data
 */
router.get('/calendar', classController.getCalendar.bind(classController));

/**
 * GET /api/classes/:id
 * Get single class by ID
 */
router.get('/:id', classController.getClassById.bind(classController));

/**
 * POST /api/classes
 * Create a new class
 */
router.post('/', classValidationRules, validate, classController.createClass.bind(classController));

/**
 * PUT /api/classes/:id
 * Update a class
 */
router.put('/:id', classController.updateClass.bind(classController));

/**
 * DELETE /api/classes/:id
 * Delete (soft) a class
 */
router.delete('/:id', classController.deleteClass.bind(classController));

/**
 * POST /api/classes/:id/generate-instances
 * Generate instances for a recurring class
 */
router.post('/:id/generate-instances', classController.generateInstances.bind(classController));

export default router;
