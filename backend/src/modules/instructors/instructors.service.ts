import { instructorsRepository } from './instructors.repository';
import { cacheService } from '../cache';
import { CreateInstructorDTO, UpdateInstructorDTO, PaginationParams, InstructorListResponse } from './instructors.dto';
import { IInstructor } from '../../models';

// ============================================
// Instructor Service - Business Logic
// ============================================

export class InstructorsService {
    /**
     * Find all instructors with pagination and filters
     */
    async findAll(search?: string, pagination?: PaginationParams): Promise<InstructorListResponse> {
        const page = pagination?.page || 1;
        const limit = pagination?.limit || 10;

        // Generate cache key
        const cacheKey = `instructors:${page}:${limit}:${search || 'all'}`;

        // Try cache first
        const cached = await cacheService.get<InstructorListResponse>(cacheKey);
        if (cached) {
            return cached;
        }

        // Fetch from database
        const result = await instructorsRepository.findAll(search, { page, limit });

        // Only cache if there's data
        if (result.data && result.data.length > 0) {
            await cacheService.set(cacheKey, result);
        }

        return result;
    }

    /**
     * Find instructor by ID
     */
    async findById(id: string): Promise<IInstructor | null> {
        // Try cache first
        const cacheKey = `instructor:${id}`;
        const cached = await cacheService.get<IInstructor>(cacheKey);
        if (cached) {
            return cached;
        }

        const instructor = await instructorsRepository.findById(id);

        if (instructor) {
            await cacheService.set(cacheKey, instructor);
        }

        return instructor;
    }

    /**
     * Create a new instructor
     */
    async create(data: CreateInstructorDTO): Promise<IInstructor> {
        const newInstructor = await instructorsRepository.create(data);

        // Invalidate cache
        await cacheService.deleteByPattern('instructors*');
        await cacheService.invalidateClasses();

        return newInstructor;
    }

    /**
     * Update an instructor
     */
    async update(id: string, data: UpdateInstructorDTO): Promise<IInstructor | null> {
        const updatedInstructor = await instructorsRepository.update(id, data);

        if (!updatedInstructor) {
            return null;
        }

        // Invalidate cache
        await cacheService.deleteByPattern('instructors*');
        await cacheService.invalidateClasses();
        await cacheService.invalidateCalendar();

        return updatedInstructor;
    }

    /**
     * Delete (soft) an instructor
     */
    async delete(id: string): Promise<IInstructor | null> {
        const deletedInstructor = await instructorsRepository.softDelete(id);

        if (!deletedInstructor) {
            return null;
        }

        // Invalidate cache
        await cacheService.deleteByPattern('instructors*');
        await cacheService.invalidateClasses();
        await cacheService.invalidateCalendar();

        return deletedInstructor;
    }
}

export const instructorsService = new InstructorsService();
