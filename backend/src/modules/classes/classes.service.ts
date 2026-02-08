import mongoose from 'mongoose';
import { classesRepository } from './classes.repository';
import { cacheService } from '../cache';
import { ConflictDetector, conflictDetector } from '../conflict';
import {
    ClassFilters,
    PaginationParams,
    CreateClassDTO,
    UpdateClassDTO,
    ClassListResponse,
    ClassStatus
} from './classes.dto';
import { IClass } from '../../models';
import { isTimeBefore, parseDateFromString } from '../../utils/dateUtils';
import { calculatePagination } from '../../shared/utils/responseFormatter';

// ============================================
// Class Service - Business Logic
// ============================================

export class ClassesService {
    /**
     * Find classes with pagination and filters
     */
    async findWithPagination(
        filters: ClassFilters,
        pagination: PaginationParams
    ): Promise<ClassListResponse> {
        const { page = 1, limit = 10 } = pagination;

        // Generate cache key
        const cacheKey = cacheService.generateClassesCacheKey(page, limit, filters);

        // Try cache first
        const cached = await cacheService.get<ClassListResponse>(cacheKey);
        if (cached) {
            return cached;
        }

        // Fetch from database
        const { data, total } = await classesRepository.findWithAggregation(filters, pagination);

        const paginationMeta = calculatePagination(total, page, limit);

        const response: ClassListResponse = {
            data,
            pagination: paginationMeta
        };

        // Only cache if there's data
        if (data && data.length > 0) {
            await cacheService.set(cacheKey, response);
        }

        return response;
    }

    /**
     * Find class by ID
     */
    async findById(id: string): Promise<IClass | null> {
        // Try cache first
        const cacheKey = cacheService.generateClassCacheKey(id);
        const cached = await cacheService.get<IClass>(cacheKey);
        if (cached) {
            return cached;
        }

        const classItem = await classesRepository.findById(id);

        if (classItem) {
            await cacheService.set(cacheKey, classItem);
        }

        return classItem;
    }

    /**
     * Create a new class
     */
    async create(data: CreateClassDTO): Promise<IClass> {
        // Validate single class time
        this.validateClassTimes(data);

        // Prepare data with ObjectIds
        const classDataWithDates = this.prepareClassData(data);

        // Create the class
        const newClass = await classesRepository.create(classDataWithDates as Partial<IClass>);

        // Invalidate cache
        await cacheService.deleteByPattern('schedule:classes:*');
        await cacheService.invalidateCalendar();

        return newClass;
    }

    /**
     * Update a class
     */
    async update(id: string, data: UpdateClassDTO): Promise<IClass | null> {
        // Check if class exists
        const existingClass = await classesRepository.findByIdRaw(id);
        if (!existingClass) {
            return null;
        }

        // Validate times if provided
        if (data.startTime && data.endTime) {
            if (isTimeBefore(data.endTime, data.startTime)) {
                throw new Error('End time must be after start time');
            }
        }

        // Prepare update data with ObjectIds
        const updateDataWithIds = this.prepareUpdateData(data);

        const updatedClass = await classesRepository.update(id, updateDataWithIds as Partial<IClass>);

        if (!updatedClass) {
            return null;
        }

        // Invalidate cache
        await cacheService.delete(`schedule:class:${id}`);
        await cacheService.invalidateCalendar();
        await cacheService.deleteByPattern('schedule:classes:*');

        return updatedClass;
    }

    /**
     * Delete (soft) a class
     */
    async delete(id: string): Promise<IClass | null> {
        const deletedClass = await classesRepository.softDelete(id);

        if (!deletedClass) {
            return null;
        }

        // Invalidate cache
        await cacheService.delete(`schedule:class:${id}`);
        await cacheService.invalidateCalendar();
        await cacheService.deleteByPattern('schedule:classes:*');

        return deletedClass;
    }

    /**
     * Update class status
     */
    async updateStatus(
        id: string,
        status: ClassStatus,
        instanceId?: string
    ): Promise<IClass | null> {
        // Check if class exists
        const existingClass = await classesRepository.findByIdRaw(id);
        if (!existingClass) {
            return null;
        }

        const updatedClass = await classesRepository.updateStatus(id, status, instanceId);

        if (!updatedClass) {
            return null;
        }

        // Invalidate cache
        await cacheService.delete(`schedule:class:${id}`);
        await cacheService.invalidateCalendar();
        await cacheService.deleteByPattern('schedule:classes:*');

        return updatedClass;
    }

    /**
     * Get calendar data
     */
    async getCalendar(
        startDate: string,
        endDate: string,
        instructorId?: string,
        roomTypeId?: string,
        roomId?: string
    ): Promise<Record<string, IClass[]>> {
        // Generate cache key
        const cacheKey = cacheService.generateCalendarCacheKey(startDate, endDate);

        // Try cache first
        const cached = await cacheService.get<Record<string, IClass[]>>(cacheKey);
        if (cached) {
            return cached;
        }

        // Fetch calendar data
        const calendarData = await classesRepository.getCalendarData(
            startDate,
            endDate,
            instructorId,
            roomTypeId,
            roomId
        );

        // Only cache if there's data
        const calendarArray = Object.values(calendarData);
        if (calendarArray.length > 0) {
            await cacheService.set(cacheKey, calendarData);
        }

        return calendarData;
    }

    /**
     * Generate instances for a recurring class
     */
    async generateInstances(id: string, generateUntil: string): Promise<{ count: number }> {
        const classItem = await classesRepository.findByIdRaw(id);

        if (!classItem) {
            throw new Error('Class not found');
        }

        if (classItem.classType !== 'recurring') {
            throw new Error('Can only generate instances for recurring classes');
        }

        // TODO: Implement instance generation logic
        // This would use the recurrence pattern to create ClassInstance documents

        // Invalidate cache
        await cacheService.invalidateClass(id);

        return { count: 0 };
    }

    // ============================================
    // Private Helper Methods
    // ============================================

    /**
     * Validate class times
     */
    private validateClassTimes(data: CreateClassDTO): void {
        if (data.classType === 'single') {
            if (isTimeBefore(data.endTime, data.startTime)) {
                throw new Error('End time must be after start time');
            }
        }

        if (data.classType === 'recurring' && data.recurrence?.timeSlots) {
            for (const slot of data.recurrence.timeSlots) {
                if (isTimeBefore(slot.endTime, slot.startTime)) {
                    throw new Error('End time must be after start time');
                }
            }
        }
    }

    /**
     * Prepare class data with ObjectIds and dates
     */
    private prepareClassData(data: CreateClassDTO): Partial<IClass> {
        return {
            name: data.name,
            description: data.description,
            courseCode: data.courseCode,
            classType: data.classType,
            startTime: data.startTime,
            endTime: data.endTime,
            recurrence: data.recurrence,
            isActive: true,
            startDate: data.classType === 'single' ? parseDateFromString(data.startDate) : new Date(),
            endDate: data.endDate ? parseDateFromString(data.endDate) : undefined,
            instructorId: new mongoose.Types.ObjectId(data.instructorId),
            roomTypeId: new mongoose.Types.ObjectId(data.roomTypeId),
            roomId: data.roomId ? new mongoose.Types.ObjectId(data.roomId) : undefined
        };
    }

    /**
     * Prepare update data with ObjectIds
     */
    private prepareUpdateData(data: UpdateClassDTO): Partial<IClass> {
        const updateData: Partial<IClass> = {
            ...data,
            startDate: data.startDate ? parseDateFromString(data.startDate) : undefined,
            endDate: data.endDate ? parseDateFromString(data.endDate) : undefined
        } as Partial<IClass>;

        if (data.instructorId) {
            updateData.instructorId = new mongoose.Types.ObjectId(data.instructorId);
        }
        if (data.roomTypeId) {
            updateData.roomTypeId = new mongoose.Types.ObjectId(data.roomTypeId);
        }
        if (data.roomId) {
            updateData.roomId = new mongoose.Types.ObjectId(data.roomId);
        }

        return updateData;
    }
}

export const classesService = new ClassesService();
