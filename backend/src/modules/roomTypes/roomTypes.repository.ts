import { RoomType, IRoomType } from '../../models';
import { CreateRoomTypeDTO, UpdateRoomTypeDTO, PaginationParams, RoomTypeListResponse } from './roomTypes.dto';

// ============================================
// RoomType Repository - Database Operations Only
// ============================================

export class RoomTypesRepository {
    /**
     * Create a new room type
     */
    async create(data: CreateRoomTypeDTO): Promise<IRoomType> {
        const roomType = new RoomType({
            ...data,
            amenities: data.amenities || [],
        });
        return roomType.save();
    }

    /**
     * Find room type by ID
     */
    async findById(id: string): Promise<IRoomType | null> {
        return RoomType.findById(id);
    }

    /**
     * Update room type
     */
    async update(id: string, data: UpdateRoomTypeDTO): Promise<IRoomType | null> {
        return RoomType.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true }
        );
    }

    /**
     * Soft delete room type
     */
    async softDelete(id: string): Promise<IRoomType | null> {
        return RoomType.findByIdAndUpdate(
            id,
            { $set: { isActive: false } },
            { new: true }
        );
    }

    /**
     * Find all room types with filters and pagination
     */
    async findAll(
        search?: string,
        pagination?: PaginationParams
    ): Promise<RoomTypeListResponse> {
        const page = pagination?.page || 1;
        const limit = pagination?.limit || 10;
        const skip = (page - 1) * limit;

        const query: Record<string, any> = { isActive: true };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        const total = await RoomType.countDocuments(query);
        const data = await RoomType.find(query)
            .sort({ name: 1 })
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
}

export const roomTypesRepository = new RoomTypesRepository();
