// ============================================
// Shared Constants
// ============================================

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
} as const;

export const CACHE_TTL = {
    DEFAULT: 3600, // 1 hour
    CLASSES: 1800, // 30 minutes
    CALENDAR: 900, // 15 minutes
    INSTRUCTORS: 3600,
    ROOMS: 1800,
    ROOM_TYPES: 3600,
} as const;

export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
} as const;

export const DATE_FORMATS = {
    TIME: 'HH:mm',
    DATE: 'yyyy-MM-dd',
    DATE_TIME: 'yyyy-MM-dd HH:mm',
} as const;

export const MESSAGES = {
    SUCCESS: {
        FETCHED: 'Data fetched successfully',
        CREATED: 'Resource created successfully',
        UPDATED: 'Resource updated successfully',
        DELETED: 'Resource deleted successfully',
    },
    ERROR: {
        NOT_FOUND: 'Resource not found',
        VALIDATION: 'Validation failed',
        CONFLICT: 'Conflict detected',
        SERVER: 'Internal server error',
    },
} as const;
