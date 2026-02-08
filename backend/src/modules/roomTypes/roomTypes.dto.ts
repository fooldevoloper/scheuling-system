// ============================================
// RoomType DTOs and Types
// ============================================

// ============================================
// Create RoomType DTO
// ============================================

export interface CreateRoomTypeDTO {
    name: string;
    capacity: number;
    description?: string;
    amenities?: string[];
}

// ============================================
// Update RoomType DTO
// ============================================

export interface UpdateRoomTypeDTO extends Partial<CreateRoomTypeDTO> {
    isActive?: boolean;
}

// ============================================
// Pagination Params
// ============================================

export interface PaginationParams {
    page?: number;
    limit?: number;
}

// ============================================
// Response Types
// ============================================

export interface RoomTypeListResponse {
    data: any[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
