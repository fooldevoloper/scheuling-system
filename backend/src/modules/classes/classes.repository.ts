import mongoose, { PipelineStage } from 'mongoose';
import { Class, IClass } from '../../models';
import { ClassFilters, PaginationParams, ClassStatus } from './classes.dto';

// ============================================
// Class Repository - Database Operations Only
// ============================================

export class ClassesRepository {
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
     * Update class status
     * For single classes: updates the main status
     * For recurring classes: updates specific instance status if instanceId provided
     * For recurring classes: if instanceId is a date-based ID (format: classId-YYYY-MM-DD or date-YYYY-MM-DD), adds/updates the generatedInstances array
     */
    async updateStatus(
        id: string,
        status: ClassStatus,
        instanceId?: string
    ): Promise<IClass | null> {
        // Check if instanceId is a date-based ID
        // Formats: date-YYYY-MM-DD, YYYY-MM-DD, or classId-YYYY-MM-DD
        const dateMatch = instanceId?.match(/(?:date-|)(20\d{2}-\d{2}-\d{2})$/);
        if (instanceId && dateMatch) {
            // Extract the date from the instanceId
            const dateStr = dateMatch[1];

            // Try to find and update existing instance in generatedInstances
            const existingClass = await Class.findById(id);
            if (!existingClass) {
                return null;
            }

            // Check if generatedInstances exists, if not initialize it
            if (!existingClass.generatedInstances) {
                // Initialize generatedInstances array with this instance
                const timeSlot = existingClass.recurrence?.timeSlots?.[0] || {
                    startTime: existingClass.startTime,
                    endTime: existingClass.endTime
                };

                return Class.findByIdAndUpdate(
                    id,
                    {
                        generatedInstances: [{
                            instanceId: new mongoose.Types.ObjectId(),
                            date: new Date(dateStr),
                            startTime: timeSlot.startTime,
                            endTime: timeSlot.endTime,
                            status: status
                        }]
                    },
                    { new: true }
                )
                    .populate('instructor')
                    .populate('roomType')
                    .populate('room')
                    .exec();
            }

            // Find existing instance
            const existingInstanceIndex = existingClass.generatedInstances.findIndex(
                (instance: any) => {
                    const instanceDate = instance.date instanceof Date
                        ? instance.date.toISOString().split('T')[0]
                        : new Date(instance.date).toISOString().split('T')[0];
                    return instanceDate === dateStr;
                }
            );

            if (existingInstanceIndex >= 0) {
                // Update existing instance using positional operator
                return Class.findOneAndUpdate(
                    { _id: id },
                    { $set: { [`generatedInstances.${existingInstanceIndex}.status`]: status } },
                    { new: true }
                )
                    .populate('instructor')
                    .populate('roomType')
                    .populate('room')
                    .exec();
            } else {
                // Add new instance to generatedInstances array
                const timeSlot = existingClass.recurrence?.timeSlots?.[0] || {
                    startTime: existingClass.startTime,
                    endTime: existingClass.endTime
                };

                return Class.findByIdAndUpdate(
                    id,
                    {
                        $push: {
                            generatedInstances: {
                                instanceId: new mongoose.Types.ObjectId(),
                                date: new Date(dateStr),
                                startTime: timeSlot.startTime,
                                endTime: timeSlot.endTime,
                                status: status
                            }
                        }
                    },
                    { new: true }
                )
                    .populate('instructor')
                    .populate('roomType')
                    .populate('room')
                    .exec();
            }
        }

        // Fallback: Update specific instance by instanceId (original behavior)
        // Only if instanceId is a valid ObjectId
        if (instanceId && mongoose.Types.ObjectId.isValid(instanceId)) {
            // Update specific instance in generatedInstances array
            return Class.findOneAndUpdate(
                {
                    _id: id,
                    'generatedInstances.instanceId': new mongoose.Types.ObjectId(instanceId)
                },
                {
                    $set: {
                        'generatedInstances.$.status': status
                    }
                },
                { new: true }
            )
                .populate('instructor')
                .populate('roomType')
                .populate('room')
                .exec();
        }

        // Update single class status (for classes without generatedInstances)
        return Class.findByIdAndUpdate(id, { status }, { new: true })
            .populate('instructor')
            .populate('roomType')
            .populate('room')
            .exec();
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
     * Get calendar data for a date range - Simplified response
     */
    async getCalendarData(
        startDate: string,
        endDate: string,
        instructorId?: string,
        roomTypeId?: string,
        roomId?: string
    ): Promise<Record<string, any[]>> {
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

        // Simplified calendar response
        const calendarData: Record<string, any[]> = {};

        for (const cls of classes) {
            // Extract simplified instructor info
            const instructorInfo = cls.instructor ? {
                id: (cls.instructor as any)._id?.toString(),
                name: (cls.instructor as any).fullName || `${(cls.instructor as any).firstName || ''} ${(cls.instructor as any).lastName || ''}`.trim()
            } : null;

            // Extract simplified room info
            const roomInfo = cls.room ? {
                id: (cls.room as any)._id?.toString(),
                name: (cls.room as any).name
            } : null;

            if (cls.classType === 'single') {
                // Single class - add once
                const dateKey = cls.startDate.toISOString().split('T')[0];
                if (!calendarData[dateKey]) {
                    calendarData[dateKey] = [];
                }
                calendarData[dateKey].push({
                    id: cls._id.toString(),
                    classId: cls._id.toString(),
                    name: cls.name,
                    courseCode: cls.courseCode,
                    instructor: instructorInfo,
                    room: roomInfo,
                    date: dateKey,
                    startTime: cls.startTime,
                    endTime: cls.endTime,
                    classType: cls.classType,
                    status: cls.status || 'scheduled'
                });
            } else {
                // Recurring class - generate instances for each day in range
                const instances = this.generateRecurringInstances(cls, start, end);

                // Create a lookup for instance statuses
                const instanceStatusMap: Record<string, string> = {};
                if (cls.generatedInstances && cls.generatedInstances.length > 0) {
                    for (const gi of cls.generatedInstances) {
                        let giDateStr: string = '';
                        const giDate = gi.date as any;
                        if (giDate instanceof Date) {
                            const year = giDate.getFullYear();
                            const month = String(giDate.getMonth() + 1).padStart(2, '0');
                            const day = String(giDate.getDate()).padStart(2, '0');
                            giDateStr = `${year}-${month}-${day}`;
                        } else if (typeof giDate === 'string') {
                            giDateStr = giDate.split('T')[0];
                        }
                        if (giDateStr) {
                            instanceStatusMap[giDateStr] = gi.status || 'scheduled';
                        }
                    }
                }

                for (const instance of instances) {
                    const dateKey = instance.date.toISOString().split('T')[0];
                    if (!calendarData[dateKey]) {
                        calendarData[dateKey] = [];
                    }

                    // Get status from map or default to scheduled
                    const instanceStatus = instanceStatusMap[dateKey] || 'scheduled';

                    // Generate deterministic instanceId
                    const instanceId = `${cls._id.toString()}-${dateKey}`;

                    // Add simplified instance info
                    calendarData[dateKey].push({
                        id: instanceId,
                        classId: cls._id.toString(),
                        name: cls.name,
                        courseCode: cls.courseCode,
                        instructor: instructorInfo,
                        room: roomInfo,
                        date: dateKey,
                        startTime: instance.startTime,
                        endTime: instance.endTime,
                        classType: cls.classType,
                        status: instanceStatus,
                        instanceId: instanceId
                    });
                }
            }
        }

        return calendarData;
    }

    /**
     * Generate instances for a recurring class within a date range
     */
    private generateRecurringInstances(
        cls: IClass,
        queryStart: Date,
        queryEnd: Date
    ): { date: Date; startTime: string; endTime: string }[] {
        const instances: { date: Date; startTime: string; endTime: string }[] = [];

        if (!cls.recurrence) return instances;

        const pattern = cls.recurrence.pattern;
        const timeSlots = cls.recurrence.timeSlots || [{ startTime: cls.startTime, endTime: cls.endTime }];
        const interval = cls.recurrence.interval || 1;

        const classStartDate = new Date(cls.startDate);
        const classEndDate = cls.recurrence.endDate ? new Date(cls.recurrence.endDate) : queryEnd;
        const effectiveEnd = classEndDate < queryEnd ? classEndDate : queryEnd;

        const exclusionDates = cls.recurrence.exclusionDates || [];
        const excludeWeekends = cls.recurrence.excludeWeekends || false;

        let currentDate = new Date(classStartDate > queryStart ? classStartDate : queryStart);

        const queryStartNormalized = new Date(queryStart);
        queryStartNormalized.setHours(0, 0, 0, 0);

        const queryEndNormalized = new Date(queryEnd);
        queryEndNormalized.setHours(23, 59, 59, 999);

        while (currentDate <= effectiveEnd && currentDate <= queryEndNormalized) {
            const currentNormalized = new Date(currentDate);
            currentNormalized.setHours(0, 0, 0, 0);

            const shouldExclude = this.shouldExcludeDate(
                currentDate,
                classStartDate,
                exclusionDates,
                excludeWeekends,
                pattern,
                cls.recurrence
            );

            if (!shouldExclude) {
                for (const slot of timeSlots) {
                    const instanceDate = new Date(currentDate);
                    instances.push({
                        date: instanceDate,
                        startTime: slot.startTime,
                        endTime: slot.endTime
                    });
                }
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }

        return instances;
    }

    /**
     * Check if a date should be excluded
     */
    private shouldExcludeDate(
        date: Date,
        classStartDate: Date,
        exclusionDates: string[],
        excludeWeekends: boolean,
        pattern: string,
        recurrence: NonNullable<IClass['recurrence']>
    ): boolean {
        const dateStr = date.toISOString().split('T')[0];

        if (exclusionDates.includes(dateStr)) {
            return true;
        }

        if (excludeWeekends) {
            const dayOfWeek = date.getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                return true;
            }
        }

        switch (pattern) {
            case 'daily':
                const dailyInterval = recurrence.interval || 1;
                const daysFromStart = Math.floor((date.getTime() - classStartDate.getTime()) / (1000 * 60 * 60 * 24));
                return daysFromStart % dailyInterval !== 0;

            case 'weekly':
                if (recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0) {
                    const dayOfWeek = date.getDay() as any;
                    return !recurrence.daysOfWeek.includes(dayOfWeek);
                }
                return true;

            case 'monthly':
                if (recurrence.dayOfMonth && recurrence.dayOfMonth.length > 0) {
                    return !recurrence.dayOfMonth.includes(date.getDate());
                }
                return true;

            case 'custom':
                const customDayOfWeek = date.getDay() as any;
                const matchesCustomDayOfWeek = !recurrence.daysOfWeek || recurrence.daysOfWeek.length === 0 || recurrence.daysOfWeek.includes(customDayOfWeek);
                const matchesCustomDayOfMonth = !recurrence.dayOfMonth || recurrence.dayOfMonth.length === 0 || recurrence.dayOfMonth.includes(date.getDate());
                return !(matchesCustomDayOfWeek && matchesCustomDayOfMonth);

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

    /**
     * Find recurring classes with exclusion settings
     */
    async findRecurringWithExclusions(): Promise<IClass[]> {
        return Class.find({
            classType: 'recurring',
            isActive: true,
            $or: [
                { 'recurrence.excludeWeekends': true },
                { 'recurrence.exclusionDates': { $exists: true, $ne: [] } }
            ]
        })
            .select('name recurrence')
            .exec();
    }
}

export const classesRepository = new ClassesRepository();
