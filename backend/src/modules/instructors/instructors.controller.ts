import { Request, Response, NextFunction } from 'express';
import { instructorsService } from './instructors.service';
import { CreateInstructorDTO, UpdateInstructorDTO } from './instructors.dto';
import { sendCreated, sendOk, sendNotFoundError } from '../../shared/utils/responseFormatter';

// ============================================
// Instructor Controller - HTTP Layer Only
// ============================================

export class InstructorsController {
    /**
     * GET /api/instructors
     * Get all instructors with pagination and filters
     */
    async getInstructors(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string;

            const result = await instructorsService.findAll(search, { page, limit });
            sendOk(res, 'Instructors Fetched', 'Instructors loaded', result);
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

            const instructor = await instructorsService.findById(id);

            if (!instructor) {
                sendNotFoundError(res, 'Instructor', id);
                return;
            }

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

            const newInstructor = await instructorsService.create(instructorData);
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

            const updatedInstructor = await instructorsService.update(id, updateData);

            if (!updatedInstructor) {
                sendNotFoundError(res, 'Instructor', id);
                return;
            }

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

            const deletedInstructor = await instructorsService.delete(id);

            if (!deletedInstructor) {
                sendNotFoundError(res, 'Instructor', id);
                return;
            }

            sendOk(res, 'Instructor Deleted', 'Instructor deleted successfully', deletedInstructor);
        } catch (error) {
            next(error);
        }
    }
}

export const instructorsController = new InstructorsController();
