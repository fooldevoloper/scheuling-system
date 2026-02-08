// ============================================
// Room DTOs and Types
// ============================================

// ============================================
// Create Room DTO
// ============================================

export interface CreateRoomDTO {
    name: string;
    roomTypeId: string;
    building?: string;
    floor?: number;
}

// ============================================
// Update Room DTO
// ============================================

export interface UpdateRoomDTO extends Partial<CreateRoomDTO> {
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

export interface RoomListResponse {
    data: any[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
