import { Request, Response, NextFunction } from 'express';
import { ApiError, FieldError } from '../types';
import { formatError } from '../utils/responseFormatter';

// ============================================
// Error Handler Middleware
// ============================================

export interface AppError extends Error {
    statusCode?: number;
    errors?: FieldError[];
    isOperational?: boolean;
}

/**
 * Error handler middleware
 */
export const errorHandler = (
    err: AppError,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    const errors = err.errors || [];

    // Log error for debugging
    console.error('Error:', {
        message: err.message,
        stack: err.stack,
        statusCode,
        path: req.path,
        method: req.method
    });

    // Send error response
    const errorResponse: ApiError = formatError(
        statusCode < 500 ? 'Error' : 'Server Error',
        message,
        errors
    );

    res.status(statusCode).json(errorResponse);
};

/**
 * Not found handler
 */
export const notFoundHandler = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const error: AppError = new Error(`Route ${req.originalUrl} not found`);
    error.statusCode = 404;
    next(error);
};

/**
 * Async handler wrapper
 */
export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * Create operational error
 */
export const createError = (
    message: string,
    statusCode: number,
    errors?: FieldError[]
): AppError => {
    const error: AppError = new Error(message);
    error.statusCode = statusCode;
    error.errors = errors;
    error.isOperational = true;
    return error;
};
