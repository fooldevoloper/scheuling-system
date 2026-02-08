import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { formatError } from '../utils/responseFormatter';

// ============================================
// Error Handler Middleware
// ============================================

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
    const errorResponse = formatError(
        statusCode < 500 ? 'Error' : 'Server Error',
        message,
        errors
    );

    res.status(statusCode).json(errorResponse);
};

// ============================================
// Not Found Handler
// ============================================

export const notFoundHandler = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const error: AppError = new Error(`Route ${req.originalUrl} not found`) as AppError;
    error.statusCode = 404;
    next(error);
};

// ============================================
// Async Handler Wrapper
// ============================================

export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// ============================================
// Export All Middlewares
// ============================================

export * from '../errors/AppError';
