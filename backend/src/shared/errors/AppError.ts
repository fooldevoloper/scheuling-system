import { FieldError } from '../utils/responseFormatter';

// ============================================
// Custom Application Errors
// ============================================

export interface AppError extends Error {
    statusCode?: number;
    errors?: FieldError[];
    isOperational?: boolean;
}

export class BaseError extends Error implements AppError {
    statusCode: number;
    errors: FieldError[];
    isOperational: boolean;

    constructor(message: string, statusCode: number = 500, errors: FieldError[] = []) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

export class NotFoundError extends BaseError {
    constructor(resource: string, id?: string) {
        const message = id ? `${resource} with id '${id}' not found` : `${resource} not found`;
        super(message, 404);
    }
}

export class ValidationError extends BaseError {
    constructor(message: string = 'Validation failed', errors: FieldError[] = []) {
        super(message, 400, errors);
    }
}

export class ConflictError extends BaseError {
    constructor(message: string, errors: FieldError[] = []) {
        super(message, 409, errors);
    }
}

export class BadRequestError extends BaseError {
    constructor(message: string, errors: FieldError[] = []) {
        super(message, 400, errors);
    }
}

export class UnauthorizedError extends BaseError {
    constructor(message: string = 'Unauthorized') {
        super(message, 401);
    }
}

export class ForbiddenError extends BaseError {
    constructor(message: string = 'Forbidden') {
        super(message, 403);
    }
}

export class InternalServerError extends BaseError {
    constructor(message: string = 'Internal server error') {
        super(message, 500);
    }
}

// ============================================
// Error Factory Functions
// ============================================

export const createError = (
    message: string,
    statusCode: number,
    errors?: FieldError[]
): AppError => {
    const error: AppError = new Error(message);
    error.statusCode = statusCode;
    error.errors = errors || [];
    error.isOperational = true;
    return error;
};

// ============================================
// Error Type Guards
// ============================================

export const isOperationalError = (error: Error): error is AppError => {
    return (error as AppError).isOperational !== undefined;
};

export const isAppError = (error: Error): error is AppError => {
    return (error as AppError).statusCode !== undefined;
};
