import { Request, Response, NextFunction } from 'express';
import mongoose, { ObjectId } from 'mongoose';
import { Class, ClassInstance, IClass } from '../models';
import { classRepository } from '../repositories';
import { conflictDetector } from '../services';
import { cacheService } from '../services';
import { sendCreated, sendOk, sendNoContent, sendNotFoundError, sendConflictError, calculatePagination } from '../utils/responseFormatter';
import { isTimeBefore, parseDateFromString, isDateInRange } from '../utils/dateUtils';
import { CreateClassDTO, UpdateClassDTO, ClassFilters, PaginationParams } from '../types';

// ============================================
// Class Controller
// ============================================

export class ClassController {
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

            // Generate cache key
            const cacheKey = cacheService.generateClassesCacheKey(page, limit, filters);

            // Try cache first
            const cached = await cacheService.get(cacheKey);
            if (cached) {
                sendOk(res, 'Classes Fetched', 'Class list loaded from cache', cached);
                return;
            }

            // Fetch from database
            const { data, total } = await classRepository.findWithAggregation(filters, pagination);

            const paginationMeta = calculatePagination(total, page, limit);

            // Format response
            const response = {
                data,
                pagination: paginationMeta
            };

            // Only cache if there's data
            if (data && data.length > 0) {
                await cacheService.set(cacheKey, response);
            }

            sendOk(res, 'Classes Fetched', 'Class list loaded', response);
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

            // Try cache first
            const cacheKey = cacheService.generateClassCacheKey(id);
            const cached = await cacheService.get(cacheKey);
            if (cached) {
                sendOk(res, 'Class Found', 'Class details loaded', cached);
                return;
            }

            const classItem = await classRepository.findById(id);

            if (!classItem) {
                sendNotFoundError(res, 'Class', id);
                return;
            }

            await cacheService.set(cacheKey, classItem);

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

            // Validate single class time
            if (classData.classType === 'single') {
                if (isTimeBefore(classData.endTime, classData.startTime)) {
                    sendConflictError(res, 'End time must be after start time');
                    return;
                }
            }

            // For recurring classes, validate time slots
            if (classData.classType === 'recurring' && classData.recurrence?.timeSlots) {
                for (const slot of classData.recurrence.timeSlots) {
                    if (isTimeBefore(slot.endTime, slot.startTime)) {
                        sendConflictError(res, 'End time must be after start time');
                        return;
                    }
                }
            }

            // Create the class
            const classDataWithDates = {
                ...classData,
                startDate: classData.classType === 'single' ? parseDateFromString(classData.startDate) : new Date(),
                endDate: classData.endDate ? parseDateFromString(classData.endDate) : undefined,
                instructorId: new mongoose.Types.ObjectId(classData.instructorId),
                roomTypeId: new mongoose.Types.ObjectId(classData.roomTypeId),
                roomId: classData.roomId ? new mongoose.Types.ObjectId(classData.roomId) : undefined
            };
            const newClass = await classRepository.create(classDataWithDates as Partial<IClass>);

            // Invalidate cache
            await cacheService.deleteByPattern('schedule:classes:*');
            await cacheService.invalidateCalendar();

            sendCreated(res, 'Class Created', 'New class scheduled successfully', newClass);
        } catch (error) {
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

            // Check if class exists
            const existingClass = await classRepository.findByIdRaw(id);
            if (!existingClass) {
                sendNotFoundError(res, 'Class', id);
                return;
            }

            // Validate times if provided
            if (updateData.startTime && updateData.endTime) {
                if (isTimeBefore(updateData.endTime, updateData.startTime)) {
                    sendConflictError(res, 'End time must be after start time');
                    return;
                }
            }

            // Update the class
            const updateDataWithIds = {
                ...updateData,
                ...(updateData.instructorId && { instructorId: new mongoose.Types.ObjectId(updateData.instructorId) }),
                ...(updateData.roomTypeId && { roomTypeId: new mongoose.Types.ObjectId(updateData.roomTypeId) }),
                ...(updateData.roomId && { roomId: new mongoose.Types.ObjectId(updateData.roomId) })
            };
            const updatedClass = await classRepository.update(id, updateDataWithIds as Partial<IClass>);

            if (!updatedClass) {
                sendNotFoundError(res, 'Class', id);
                return;
            }

            // Invalidate cache
            await cacheService.delete(`schedule:class:${id}`);
            await cacheService.invalidateCalendar();
            await cacheService.deleteByPattern('schedule:classes:*');

            sendOk(res, 'Class Updated', 'Class updated successfully', updatedClass);
        } catch (error) {
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

            const deletedClass = await classRepository.softDelete(id);

            if (!deletedClass) {
                sendNotFoundError(res, 'Class', id);
                return;
            }

            // Invalidate cache
            await cacheService.delete(`schedule:class:${id}`);
            await cacheService.invalidateCalendar();
            await cacheService.deleteByPattern('schedule:classes:*');

            sendOk(res, 'Class Deleted', 'Class deleted successfully', deletedClass);
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

            // Generate cache key
            const cacheKey = cacheService.generateCalendarCacheKey(startDate, endDate);

            // Try cache first
            const cached = await cacheService.get(cacheKey);
            if (cached) {
                sendOk(res, 'Calendar Data', 'Calendar view loaded from cache', cached);
                return;
            }

            // Fetch calendar data
            const calendarData = await classRepository.getCalendarData(
                startDate,
                endDate,
                instructorId,
                roomTypeId,
                roomId
            );

            // Only cache if there's data
            const calendarArray = Array.isArray(calendarData) ? calendarData : [];
            if (calendarArray.length > 0) {
                await cacheService.set(cacheKey, calendarData);
            }

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

            const classItem = await classRepository.findByIdRaw(id);

            if (!classItem) {
                sendNotFoundError(res, 'Class', id);
                return;
            }

            if (classItem.classType !== 'recurring') {
                sendConflictError(res, 'Can only generate instances for recurring classes');
                return;
            }

            // Generate instances logic would go here
            // This would use the recurrence pattern to create ClassInstance documents

            sendOk(res, 'Instances Generated', 'Class instances generated successfully', { count: 0 });
        } catch (error) {
            next(error);
        }
    }
}

// Export singleton instance
export const classController = new ClassController();
