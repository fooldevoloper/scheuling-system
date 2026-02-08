// ============================================
// Instructor DTOs and Types
// ============================================

// ============================================
// Create Instructor DTO
// ============================================

export interface CreateInstructorDTO {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    specialization?: string;
    bio?: string;
    avatar?: string;
}

// ============================================
// Update Instructor DTO
// ============================================

export interface UpdateInstructorDTO extends Partial<CreateInstructorDTO> {
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

export interface InstructorListResponse {
    data: any[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
