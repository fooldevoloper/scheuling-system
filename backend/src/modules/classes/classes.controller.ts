import { Request, Response, NextFunction } from 'express';
import { classesService } from './classes.service';
import {
    ClassFilters,
    PaginationParams,
    CreateClassDTO,
    UpdateClassDTO,
    UpdateClassStatusDTO
} from './classes.dto';
import { sendCreated, sendOk, sendNotFoundError, sendConflictError } from '../../shared/utils/responseFormatter';

// ============================================
// Class Controller - HTTP Layer Only
// ============================================

export class ClassesController {
    /**
     * GET /api/classes
     * Get all classes with pagination and filters
     */
    async getClasses(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string;
            const startDate = req.query.startDate as string;
            const endDate = req.query.endDate as string;
            const instructorId = req.query.instructorId as string;
            const roomTypeId = req.query.roomTypeId as string;
            const roomId = req.query.roomId as string;
            const pattern = req.query.pattern as 'daily' | 'weekly' | 'monthly' | 'custom' | 'single';

            const filters: ClassFilters = {
                search,
                startDate,
                endDate,
                instructorId,
                roomTypeId,
                roomId,
                pattern
            };

            const pagination: PaginationParams = { page, limit };

            const result = await classesService.findWithPagination(filters, pagination);
            sendOk(res, 'Classes Fetched', 'Class list loaded', result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/classes/:id
     * Get single class by ID
     */
    async getClassById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const classItem = await classesService.findById(id);

            if (!classItem) {
                sendNotFoundError(res, 'Class', id);
                return;
            }

            sendOk(res, 'Class Found', 'Class details loaded', classItem);
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/classes
     * Create a new class
     */
    async createClass(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const classData = req.body as CreateClassDTO;

            const newClass = await classesService.create(classData);

            sendCreated(res, 'Class Created', 'New class scheduled successfully', newClass);
        } catch (error) {
            if (error instanceof Error && error.message === 'End time must be after start time') {
                sendConflictError(res, error.message);
                return;
            }
            next(error);
        }

    }

    /**
     * PUT /api/classes/:id
     * Update a class
     */
    async updateClass(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const updateData = req.body as UpdateClassDTO;

            const updatedClass = await classesService.update(id, updateData);

            if (!updatedClass) {
                sendNotFoundError(res, 'Class', id);
                return;
            }

            sendOk(res, 'Class Updated', 'Class updated successfully', updatedClass);
        } catch (error) {
            if (error instanceof Error && error.message.includes('End time must be after start time')) {
                sendConflictError(res, error.message);
                return;
            }
            next(error);
        }
    }

    /**
     * DELETE /api/classes/:id
     * Delete (soft) a class
     */
    async deleteClass(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const deletedClass = await classesService.delete(id);

            if (!deletedClass) {
                sendNotFoundError(res, 'Class', id);
                return;
            }

            sendOk(res, 'Class Deleted', 'Class deleted successfully', deletedClass);
        } catch (error) {
            next(error);
        }
    }

    /**
     * PATCH /api/classes/:id/status
     * Update class status
     */
    async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const { instanceId, status } = req.body as UpdateClassStatusDTO;

            const updatedClass = await classesService.updateStatus(id, status, instanceId);

            if (!updatedClass) {
                sendNotFoundError(res, 'Class', id);
                return;
            }

            sendOk(res, 'Status Updated', 'Class status updated successfully', updatedClass);
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/classes/calendar
     * Get calendar view data
     */
    async getCalendar(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const startDate = req.query.startDate as string;
            const endDate = req.query.endDate as string;
            const instructorId = req.query.instructorId as string;
            const roomTypeId = req.query.roomTypeId as string;
            const roomId = req.query.roomId as string;

            if (!startDate || !endDate) {
                sendConflictError(res, 'Start date and end date are required');
                return;
            }

            const calendarData = await classesService.getCalendar(
                startDate,
                endDate,
                instructorId,
                roomTypeId,
                roomId
            );

            sendOk(res, 'Calendar Data', 'Calendar view loaded', calendarData);
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/classes/:id/generate-instances
     * Generate instances for a recurring class
     */
    async generateInstances(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const { generateUntil } = req.body;

            const result = await classesService.generateInstances(id, generateUntil);
            sendOk(res, 'Instances Generated', 'Class instances generated successfully', result);
        } catch (error) {
            if (error instanceof Error) {
                if (error.message === 'Class not found') {
                    sendNotFoundError(res, 'Class', req.params.id);
                    return;
                }
                if (error.message === 'Can only generate instances for recurring classes') {
                    sendConflictError(res, error.message);
                    return;
                }
            }
            next(error);
        }
    }
}

export const classesController = new ClassesController();
