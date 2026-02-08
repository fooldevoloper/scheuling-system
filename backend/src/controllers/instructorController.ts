import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Instructor, IInstructor } from '../models';
import { sendCreated, sendOk, sendNotFoundError } from '../utils/responseFormatter';
import { CreateInstructorDTO, UpdateInstructorDTO } from '../types';
import { cacheService } from '../services/cacheService';

// ============================================
// Instructor Controller
// ============================================

export class InstructorController {
    /**
     * GET /api/instructors
     * Get all instructors with pagination and filters
     */
    async getInstructors(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string;

            // Generate cache key
            const cacheKey = `instructors:${page}:${limit}:${search || 'all'}`;

            // Try cache first
            const cached = await cacheService.get(cacheKey);
            if (cached) {
                sendOk(res, 'Instructors Fetched', 'Instructors loaded from cache', cached);
                return;
            }

            const query: Record<string, any> = { isActive: true };

            if (search) {
                query.$or = [
                    { firstName: { $regex: search, $options: 'i' } },
                    { lastName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { specialization: { $regex: search, $options: 'i' } },
                ];
            }

            const skip = (page - 1) * limit;
            const total = await Instructor.countDocuments(query);
            const instructors = await Instructor.find(query)
                .sort({ lastName: 1, firstName: 1 })
                .skip(skip)
                .limit(limit);

            const response = {
                data: instructors,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            };

            // Only cache if there's data
            if (instructors && instructors.length > 0) {
                await cacheService.set(cacheKey, response);
            }

            sendOk(res, 'Instructors Fetched', 'Instructors loaded', response);
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/instructors/:id
     * Get single instructor by ID
     */
    async getInstructorById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            // Try cache first
            const cacheKey = `instructor:${id}`;
            const cached = await cacheService.get(cacheKey);
            if (cached) {
                sendOk(res, 'Instructor Found', 'Instructor details loaded from cache', cached);
                return;
            }

            const instructor = await Instructor.findById(id);

            if (!instructor) {
                sendNotFoundError(res, 'Instructor', id);
                return;
            }

            // Cache the response
            await cacheService.set(cacheKey, instructor);

            sendOk(res, 'Instructor Found', 'Instructor details loaded', instructor);
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/instructors
     * Create a new instructor
     */
    async createInstructor(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const instructorData = req.body as CreateInstructorDTO;

            const newInstructor = new Instructor(instructorData);
            await newInstructor.save();

            // Invalidate cache
            await cacheService.deleteByPattern('instructors*');
            await cacheService.invalidateClasses();

            sendCreated(res, 'Instructor Created', 'New instructor created successfully', newInstructor);
        } catch (error) {
            next(error);
        }
    }

    /**
     * PUT /api/instructors/:id
     * Update an instructor
     */
    async updateInstructor(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const updateData = req.body as UpdateInstructorDTO;

            const updatedInstructor = await Instructor.findByIdAndUpdate(
                id,
                { $set: updateData },
                { new: true }
            );

            if (!updatedInstructor) {
                sendNotFoundError(res, 'Instructor', id);
                return;
            }

            // Invalidate cache
            await cacheService.invalidateInstructor(id);

            sendOk(res, 'Instructor Updated', 'Instructor updated successfully', updatedInstructor);
        } catch (error) {
            next(error);
        }
    }

    /**
     * DELETE /api/instructors/:id
     * Delete (soft) an instructor
     */
    async deleteInstructor(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            const deletedInstructor = await Instructor.findByIdAndUpdate(
                id,
                { $set: { isActive: false } },
                { new: true }
            );

            if (!deletedInstructor) {
                sendNotFoundError(res, 'Instructor', id);
                return;
            }

            // Invalidate cache
            await cacheService.invalidateInstructor(id);

            sendOk(res, 'Instructor Deleted', 'Instructor deleted successfully', deletedInstructor);
        } catch (error) {
            next(error);
        }
    }
}

// Export singleton instance
export const instructorController = new InstructorController();
