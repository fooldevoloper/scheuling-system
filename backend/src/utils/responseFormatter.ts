import { Response } from 'express';
import { ApiResponse, PaginatedResponse, ApiError, FieldError, Pagination } from '../types';

// ============================================
// Response Formatter Utilities
// ============================================

/**
 * Format a successful API response
 */
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

/**
 * Format a paginated successful API response
 */
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

/**
 * Format an error API response
 */
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

/**
 * Format a validation error response
 */
export const formatValidationError = (errors: FieldError[]): ApiError => {
    return {
        title: 'Validation Error',
        message: 'Invalid input data',
        errors,
    };
};

/**
 * Format a not found error response
 */
export const formatNotFoundError = (resource: string, id?: string): ApiError => {
    return {
        title: 'Not Found',
        message: id ? `${resource} with id '${id}' not found` : `${resource} not found`,
        errors: [],
    };
};

/**
 * Format a conflict error response
 */
export const formatConflictError = (message: string, conflicts: FieldError[] = []): ApiError => {
    return {
        title: 'Conflict Error',
        message,
        errors: conflicts,
    };
};

/**
 * Calculate pagination metadata
 */
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

/**
 * Send a success response
 */
export const sendSuccess = <T>(
    res: Response,
    statusCode: number,
    title: string,
    message: string,
    data: T
): Response => {
    return res.status(statusCode).json(formatSuccess(title, message, data));
};

/**
 * Send a paginated success response
 */
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

/**
 * Send an error response
 */
export const sendError = (
    res: Response,
    statusCode: number,
    error: ApiError
): Response => {
    return res.status(statusCode).json(error);
};

/**
 * Send a validation error response
 */
export const sendValidationError = (
    res: Response,
    errors: FieldError[]
): Response => {
    return res.status(400).json(formatValidationError(errors));
};

/**
 * Send a not found error response
 */
export const sendNotFoundError = (
    res: Response,
    resource: string,
    id?: string
): Response => {
    return res.status(404).json(formatNotFoundError(resource, id));
};

/**
 * Send a conflict error response
 */
export const sendConflictError = (
    res: Response,
    message: string,
    conflicts: FieldError[] = []
): Response => {
    return res.status(409).json(formatConflictError(message, conflicts));
};

/**
 * Send a created response
 */
export const sendCreated = <T>(
    res: Response,
    title: string,
    message: string,
    data: T
): Response => {
    return sendSuccess(res, 201, title, message, data);
};

/**
 * Send an ok response
 */
export const sendOk = <T>(
    res: Response,
    title: string,
    message: string,
    data: T
): Response => {
    return sendSuccess(res, 200, title, message, data);
};

/**
 * Send a no content response
 */
export const sendNoContent = (res: Response): Response => {
    return res.status(204).send();
};

// ============================================
// Field Error Helpers
// ============================================

/**
 * Create a field error object
 */
export const createFieldError = (field: string, message: string): FieldError => ({
    field,
    message,
});

/**
 * Extract field errors from express-validator errors
 */
export const extractValidationErrors = (validationErrors: any[]): FieldError[] => {
    return validationErrors.map((error) => ({
        field: error.path || error.param || error.field,
        message: error.msg || error.message || 'Invalid value',
    }));
};
