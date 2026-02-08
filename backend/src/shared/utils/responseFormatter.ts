import { Response } from 'express';

// ============================================
// Response Types
// ============================================

export interface ApiResponse<T> {
    title: string;
    message: string;
    data: T;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: Pagination;
}

export interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ApiError {
    title: string;
    message: string;
    errors: FieldError[];
}

export interface FieldError {
    field: string;
    message: string;
}

// ============================================
// Response Formatters
// ============================================

export const formatSuccess = <T>(
    title: string,
    message: string,
    data: T
): ApiResponse<T> => {
    return {
        title,
        message,
        data,
    };
};

export const formatPaginatedSuccess = <T>(
    title: string,
    message: string,
    data: T[],
    pagination: Pagination
): PaginatedResponse<T> => {
    return {
        title,
        message,
        data,
        pagination,
    };
};

export const formatError = (
    title: string,
    message: string,
    errors: FieldError[] = []
): ApiError => {
    return {
        title,
        message,
        errors,
    };
};

export const formatValidationError = (errors: FieldError[]): ApiError => {
    return {
        title: 'Validation Error',
        message: 'Invalid input data',
        errors,
    };
};

export const formatNotFoundError = (resource: string, id?: string): ApiError => {
    return {
        title: 'Not Found',
        message: id ? `${resource} with id '${id}' not found` : `${resource} not found`,
        errors: [],
    };
};

export const formatConflictError = (message: string, conflicts: FieldError[] = []): ApiError => {
    return {
        title: 'Conflict Error',
        message,
        errors: conflicts,
    };
};

export const calculatePagination = (
    total: number,
    page: number,
    limit: number
): Pagination => {
    const totalPages = Math.ceil(total / limit);

    return {
        total,
        page,
        limit,
        totalPages,
    };
};

// ============================================
// Express Response Helpers
// ============================================

export const sendSuccess = <T>(
    res: Response,
    statusCode: number,
    title: string,
    message: string,
    data: T
): Response => {
    return res.status(statusCode).json(formatSuccess(title, message, data));
};

export const sendPaginatedSuccess = <T>(
    res: Response,
    statusCode: number,
    title: string,
    message: string,
    data: T[],
    pagination: Pagination
): Response => {
    return res.status(statusCode).json(formatPaginatedSuccess(title, message, data, pagination));
};

export const sendError = (
    res: Response,
    statusCode: number,
    error: ApiError
): Response => {
    return res.status(statusCode).json(error);
};

export const sendValidationError = (
    res: Response,
    errors: FieldError[]
): Response => {
    return res.status(400).json(formatValidationError(errors));
};

export const sendNotFoundError = (
    res: Response,
    resource: string,
    id?: string
): Response => {
    return res.status(404).json(formatNotFoundError(resource, id));
};

export const sendConflictError = (
    res: Response,
    message: string,
    conflicts: FieldError[] = []
): Response => {
    return res.status(409).json(formatConflictError(message, conflicts));
};

export const sendCreated = <T>(
    res: Response,
    title: string,
    message: string,
    data: T
): Response => {
    return sendSuccess(res, 201, title, message, data);
};

export const sendOk = <T>(
    res: Response,
    title: string,
    message: string,
    data: T
): Response => {
    return sendSuccess(res, 200, title, message, data);
};

export const sendNoContent = (res: Response): Response => {
    return res.status(204).send();
};

// ============================================
// Field Error Helpers
// ============================================

export const createFieldError = (field: string, message: string): FieldError => ({
    field,
    message,
});

export const extractValidationErrors = (validationErrors: any[]): FieldError[] => {
    return validationErrors.map((error) => ({
        field: error.path || error.param || error.field,
        message: error.msg || error.message || 'Invalid value',
    }));
};
