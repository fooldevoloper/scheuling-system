import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { sendValidationError, extractValidationErrors } from '../utils/responseFormatter';

// ============================================
// Validation Middleware
// ============================================

/**
 * Run validation and return errors if any
 */
export const validate = (validations: ValidationChain[]) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        // Run all validations
        await Promise.all(validations.map(validation => validation.run(req)));

        // Check for errors
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            const fieldErrors = extractValidationErrors(errors.array());
            sendValidationError(res, fieldErrors);
            return;
        }

        next();
    };
};

// ============================================
// Class Validation Rules
// ============================================

import { body } from 'express-validator';

export const classValidationRules = [
    body('name')
        .trim()
        .notEmpty().withMessage('Class name is required')
        .isLength({ max: 200 }).withMessage('Class name cannot exceed 200 characters'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 2000 }).withMessage('Description cannot exceed 2000 characters'),

    body('courseCode')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('Course code cannot exceed 50 characters'),

    body('instructorId')
        .notEmpty().withMessage('Instructor is required')
        .isMongoId().withMessage('Invalid instructor ID'),

    body('roomTypeId')
        .notEmpty().withMessage('Room type is required')
        .isMongoId().withMessage('Invalid room type ID'),

    body('roomId')
        .optional()
        .isMongoId().withMessage('Invalid room ID'),

    body('classType')
        .notEmpty().withMessage('Class type is required')
        .isIn(['single', 'recurring']).withMessage('Class type must be single or recurring'),

    // Single class validation
    body('startDate')
        .if(body('classType').equals('single'))
        .notEmpty().withMessage('Start date is required for single class')
        .isISO8601().withMessage('Invalid start date format'),

    body('endDate')
        .optional()
        .isISO8601().withMessage('Invalid end date format'),

    body('startTime')
        .notEmpty().withMessage('Start time is required')
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid start time format (HH:mm)'),

    body('endTime')
        .notEmpty().withMessage('End time is required')
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid end time format (HH:mm)'),

    // Recurring class validation
    body('recurrence')
        .if(body('classType').equals('recurring'))
        .notEmpty().withMessage('Recurrence config is required for recurring class'),

    body('recurrence.pattern')
        .if(body('recurrence').exists())
        .notEmpty().withMessage('Recurrence pattern is required')
        .isIn(['daily', 'weekly', 'monthly', 'custom']).withMessage('Invalid recurrence pattern'),

    body('recurrence.daysOfWeek')
        .optional()
        .isArray({ min: 1 }).withMessage('At least one day must be selected')
        .custom((value: number[]) => {
            if (value.some(day => day < 0 || day > 6)) {
                throw new Error('Days of week must be between 0 (Sunday) and 6 (Saturday)');
            }
            return true;
        }),

    body('recurrence.dayOfMonth')
        .optional()
        .isArray({ min: 1 }).withMessage('At least one day must be selected')
        .custom((value: number[]) => {
            if (value.some(day => day < 1 || day > 31)) {
                throw new Error('Days of month must be between 1 and 31');
            }
            return true;
        }),

    body('recurrence.interval')
        .optional()
        .isInt({ min: 1 }).withMessage('Interval must be a positive integer'),

    body('recurrence.timeSlots')
        .optional()
        .isArray({ min: 1 }).withMessage('At least one time slot is required'),

    body('recurrence.timeSlots.*.startTime')
        .optional()
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format (HH:mm)'),

    body('recurrence.timeSlots.*.endTime')
        .optional()
        .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format (HH:mm)'),

    body('recurrence.endDate')
        .optional()
        .isISO8601().withMessage('Invalid end date format'),

    body('recurrence.occurrences')
        .optional()
        .isInt({ min: 1 }).withMessage('Occurrences must be a positive integer'),
];

// ============================================
// Room Type Validation Rules
// ============================================

export const roomTypeValidationRules = [
    body('name')
        .trim()
        .notEmpty().withMessage('Room type name is required')
        .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),

    body('capacity')
        .notEmpty().withMessage('Capacity is required')
        .isInt({ min: 1, max: 10000 }).withMessage('Capacity must be between 1 and 10000'),

    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),

    body('amenities')
        .optional()
        .isArray().withMessage('Amenities must be an array'),
];

// ============================================
// Room Validation Rules
// ============================================

export const roomValidationRules = [
    body('name')
        .trim()
        .notEmpty().withMessage('Room name is required')
        .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),

    body('roomTypeId')
        .notEmpty().withMessage('Room type is required')
        .isMongoId().withMessage('Invalid room type ID'),

    body('building')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Building name cannot exceed 100 characters'),

    body('floor')
        .optional()
        .isInt({ min: 0, max: 200 }).withMessage('Floor must be between 0 and 200'),
];

// ============================================
// Instructor Validation Rules
// ============================================

export const instructorValidationRules = [
    body('firstName')
        .trim()
        .notEmpty().withMessage('First name is required')
        .isLength({ max: 50 }).withMessage('First name cannot exceed 50 characters'),

    body('lastName')
        .trim()
        .notEmpty().withMessage('Last name is required')
        .isLength({ max: 50 }).withMessage('Last name cannot exceed 50 characters'),

    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),

    body('phone')
        .optional()
        .trim()
        .matches(/^\+?[\d\s-]+$/).withMessage('Invalid phone number format'),

    body('specialization')
        .optional()
        .trim()
        .isLength({ max: 200 }).withMessage('Specialization cannot exceed 200 characters'),

    body('bio')
        .optional()
        .trim()
        .isLength({ max: 1000 }).withMessage('Bio cannot exceed 1000 characters'),
];
