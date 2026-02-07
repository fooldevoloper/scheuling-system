import mongoose, { PipelineStage } from 'mongoose';
import { Class, ClassInstance, Instructor, RoomType, Room, IClass, DayOfWeek } from '../models';
import { ClassFilters, PaginationParams } from '../types';

// ============================================
// Class Repository
// ============================================

export class ClassRepository {
    /**
     * Create a new class
     */
    async create(classData: Partial<IClass>): Promise<IClass> {
        const newClass = new Class(classData);
        return newClass.save();
    }

    /**
     * Find class by ID with populated references
     */
    async findById(id: string): Promise<IClass | null> {
        return Class.findById(id)
            .populate('instructor')
            .populate('roomType')
            .populate('room')
            .exec();
    }

    /**
     * Find class by ID without population
     */
    async findByIdRaw(id: string): Promise<IClass | null> {
        return Class.findById(id);
    }

    /**
     * Update class
     */
    async update(id: string, updateData: Partial<IClass>): Promise<IClass | null> {
        return Class.findByIdAndUpdate(id, updateData, { new: true })
            .populate('instructor')
            .populate('roomType')
            .populate('room')
            .exec();
    }

    /**
     * Soft delete class
     */
    async softDelete(id: string): Promise<IClass | null> {
        return Class.findByIdAndUpdate(id, { isActive: false }, { new: true });
    }

    /**
     * Find classes with filters and pagination using aggregation pipeline
     */
    async findWithAggregation(
        filters: ClassFilters,
        pagination: PaginationParams
    ): Promise<{ data: IClass[]; total: number }> {
        const { page = 1, limit = 10 } = pagination;
        const skip = (page - 1) * limit;

        // Build match stage
        const matchStage = this.buildMatchStage(filters);

        // Build aggregation pipeline
        const pipeline: PipelineStage[] = [
            { $match: matchStage },
            // Lookup instructor
            {
                $lookup: {
                    from: 'instructors',
                    localField: 'instructorId',
                    foreignField: '_id',
                    as: 'instructor'
                }
            },
            { $unwind: { path: '$instructor', preserveNullAndEmptyArrays: true } },
            // Lookup roomType
            {
                $lookup: {
                    from: 'roomtypes',
                    localField: 'roomTypeId',
                    foreignField: '_id',
                    as: 'roomType'
                }
            },
            { $unwind: { path: '$roomType', preserveNullAndEmptyArrays: true } },
            // Lookup room
            {
                $lookup: {
                    from: 'rooms',
                    localField: 'roomId',
                    foreignField: '_id',
                    as: 'room'
                }
            },
            { $unwind: { path: '$room', preserveNullAndEmptyArrays: true } },
            // Sort by start date
            { $sort: { startDate: 1 } },
            // Get total count
            {
                $facet: {
                    metadata: [{ $count: 'total' }],
                    data: [{ $skip: skip }, { $limit: limit }]
                }
            }
        ];

        const results = await Class.aggregate(pipeline);

        const total = results[0]?.metadata[0]?.total || 0;
        const data = results[0]?.data || [];

        return { data, total };
    }

    /**
     * Build match stage for aggregation
     */
    private buildMatchStage(filters: ClassFilters): Record<string, any> {
        const match: Record<string, any> = { isActive: true };

        // Text search
        if (filters.search) {
            match.$text = { $search: filters.search };
        }

        // Date range filter
        if (filters.startDate && filters.endDate) {
            match.$or = [
                {
                    classType: 'single',
                    startDate: { $lte: new Date(filters.endDate) },
                    endDate: { $gte: new Date(filters.startDate) }
                },
                {
                    classType: 'recurring',
                    'recurrence.endDate': { $gte: new Date(filters.startDate) }
                }
            ];
        } else if (filters.startDate) {
            match.$or = [
                { 'startDate': { $gte: new Date(filters.startDate) } },
                { 'recurrence.endDate': { $gte: new Date(filters.startDate) } }
            ];
        } else if (filters.endDate) {
            match.$or = [
                { 'endDate': { $lte: new Date(filters.endDate) } }
            ];
        }

        // Instructor filter
        if (filters.instructorId) {
            match.instructorId = new mongoose.Types.ObjectId(filters.instructorId);
        }

        // Room type filter
        if (filters.roomTypeId) {
            match.roomTypeId = new mongoose.Types.ObjectId(filters.roomTypeId);
        }

        // Room filter
        if (filters.roomId) {
            match.roomId = new mongoose.Types.ObjectId(filters.roomId);
        }

        // Recurrence pattern filter
        if (filters.pattern) {
            if (filters.pattern === 'single') {
                match.classType = 'single';
            } else {
                match.classType = 'recurring';
                match['recurrence.pattern'] = filters.pattern;
            }
        }

        return match;
    }

    /**
     * Get calendar data for a date range
     */
    async getCalendarData(
        startDate: string,
        endDate: string,
        instructorId?: string,
        roomTypeId?: string,
        roomId?: string
    ): Promise<Record<string, IClass[]>> {
        const start = new Date(startDate);
        const end = new Date(endDate);

        const match: Record<string, any> = {
            isActive: true,
            $or: [
                // Single classes within range
                {
                    classType: 'single',
                    startDate: { $lte: end },
                    endDate: { $gte: start }
                },
                // Recurring classes that overlap with range
                {
                    classType: 'recurring',
                    'recurrence.endDate': { $gte: start }
                }
            ]
        };

        if (instructorId) {
            match.instructorId = new mongoose.Types.ObjectId(instructorId);
        }
        if (roomTypeId) {
            match.roomTypeId = new mongoose.Types.ObjectId(roomTypeId);
        }
        if (roomId) {
            match.roomId = new mongoose.Types.ObjectId(roomId);
        }

        const classes = await Class.find(match)
            .populate('instructor')
            .populate('roomType')
            .populate('room')
            .sort({ startDate: 1 })
            .exec();

        // Group by date
        const calendarData: Record<string, IClass[]> = {};

        for (const cls of classes) {
            if (cls.classType === 'single') {
                // Single class - add once
                const dateKey = cls.startDate.toISOString().split('T')[0];
                if (!calendarData[dateKey]) {
                    calendarData[dateKey] = [];
                }
                calendarData[dateKey].push(cls);
            } else {
                // Recurring class - generate instances and add to each date
                const instances = this.generateClassInstances(cls, start, end);
                for (const instance of instances) {
                    const dateKey = instance.date.toISOString().split('T')[0];
                    if (!calendarData[dateKey]) {
                        calendarData[dateKey] = [];
                    }
                    // Add instance info to class
                    const classWithInstance = {
                        ...cls.toObject(),
                        instanceDate: instance.date,
                        instanceStartTime: instance.startTime,
                        instanceEndTime: instance.endTime
                    };
                    calendarData[dateKey].push(classWithInstance as any);
                }
            }
        }

        return calendarData;
    }

    /**
     * Generate instances for a recurring class within a date range
     */
    private generateClassInstances(
        cls: IClass,
        startDate: Date,
        endDate: Date
    ): { date: Date; startTime: string; endTime: string }[] {
        const instances: { date: Date; startTime: string; endTime: string }[] = [];

        if (!cls.recurrence) return instances;

        const pattern = cls.recurrence.pattern;
        const timeSlots = cls.recurrence.timeSlots || [{ startTime: cls.startTime, endTime: cls.endTime }];
        const interval = cls.recurrence.interval || 1;
        const end = cls.recurrence.endDate || endDate;

        let currentDate = new Date(startDate);

        while (currentDate <= end && currentDate <= endDate) {
            const shouldInclude = this.checkRecurrenceMatch(cls.recurrence!, currentDate);

            if (shouldInclude) {
                for (const slot of timeSlots) {
                    instances.push({
                        date: new Date(currentDate),
                        startTime: slot.startTime,
                        endTime: slot.endTime
                    });
                }
            }

            // Move to next date based on pattern
            switch (pattern) {
                case 'daily':
                    currentDate.setDate(currentDate.getDate() + interval);
                    break;
                case 'weekly':
                    currentDate.setDate(currentDate.getDate() + 7 * interval);
                    break;
                case 'monthly':
                    currentDate.setMonth(currentDate.getMonth() + interval);
                    break;
                default:
                    currentDate.setDate(currentDate.getDate() + 1);
            }
        }

        return instances;
    }

    /**
     * Check if a date matches the recurrence pattern
     */
    private checkRecurrenceMatch(
        recurrence: NonNullable<IClass['recurrence']>,
        date: Date
    ): boolean {
        switch (recurrence.pattern) {
            case 'daily':
                return true;

            case 'weekly':
                if (recurrence.daysOfWeek) {
                    const dayOfWeek = date.getDay() as DayOfWeek;
                    return recurrence.daysOfWeek.includes(dayOfWeek);
                }
                return false;

            case 'monthly':
                if (recurrence.dayOfMonth) {
                    return recurrence.dayOfMonth.includes(date.getDate());
                }
                return false;

            case 'custom':
                return true;

            default:
                return false;
        }
    }

    /**
     * Find classes by instructor ID
     */
    async findByInstructor(instructorId: string): Promise<IClass[]> {
        return Class.find({
            instructorId: new mongoose.Types.ObjectId(instructorId),
            isActive: true
        })
            .populate('roomType')
            .populate('room')
            .sort({ startDate: 1 })
            .exec();
    }

    /**
     * Find classes by room ID
     */
    async findByRoom(roomId: string): Promise<IClass[]> {
        return Class.find({
            roomId: new mongoose.Types.ObjectId(roomId),
            isActive: true
        })
            .populate('instructor')
            .populate('roomType')
            .sort({ startDate: 1 })
            .exec();
    }
}

// Export singleton instance
export const classRepository = new ClassRepository();
