import mongoose from 'mongoose';
import { Instructor, IInstructor } from '../../models';
import { CreateInstructorDTO, UpdateInstructorDTO, PaginationParams, InstructorListResponse } from './instructors.dto';

// ============================================
// Instructor Repository - Database Operations Only
// ============================================

export class InstructorsRepository {
    /**
     * Create a new instructor
     */
    async create(data: CreateInstructorDTO): Promise<IInstructor> {
        const instructor = new Instructor(data);
        return instructor.save();
    }

    /**
     * Find instructor by ID
     */
    async findById(id: string): Promise<IInstructor | null> {
        return Instructor.findById(id);
    }

    /**
     * Update instructor
     */
    async update(id: string, data: UpdateInstructorDTO): Promise<IInstructor | null> {
        return Instructor.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true }
        );
    }

    /**
     * Soft delete instructor
     */
    async softDelete(id: string): Promise<IInstructor | null> {
        return Instructor.findByIdAndUpdate(
            id,
            { $set: { isActive: false } },
            { new: true }
        );
    }

    /**
     * Find all instructors with filters and pagination
     */
    async findAll(
        search?: string,
        pagination?: PaginationParams
    ): Promise<InstructorListResponse> {
        const page = pagination?.page || 1;
        const limit = pagination?.limit || 10;
        const skip = (page - 1) * limit;

        const query: Record<string, any> = { isActive: true };

        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { specialization: { $regex: search, $options: 'i' } },
            ];
        }

        const total = await Instructor.countDocuments(query);
        const data = await Instructor.find(query)
            .sort({ lastName: 1, firstName: 1 })
            .skip(skip)
            .limit(limit);

        return {
            data,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Find by email
     */
    async findByEmail(email: string): Promise<IInstructor | null> {
        return Instructor.findOne({ email });
    }
}

export const instructorsRepository = new InstructorsRepository();
