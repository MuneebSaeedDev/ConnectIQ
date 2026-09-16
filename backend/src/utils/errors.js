"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamNotFoundError = exports.DepartmentNotFoundError = exports.OrganizationNotFoundError = exports.OrganizationError = exports.ConflictError = exports.NotFoundError = exports.AuthorizationError = exports.AuthenticationError = exports.ValidationError = exports.AppError = void 0;
class AppError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class ValidationError extends AppError {
    errors;
    constructor(message = 'Validation failed', errors) {
        super(message, 400);
        this.name = 'ValidationError';
        this.errors = errors;
    }
}
exports.ValidationError = ValidationError;
class AuthenticationError extends AppError {
    constructor(message = 'Authentication required') {
        super(message, 401);
        this.name = 'AuthenticationError';
    }
}
exports.AuthenticationError = AuthenticationError;
class AuthorizationError extends AppError {
    constructor(message = 'Permission denied') {
        super(message, 403);
        this.name = 'AuthorizationError';
    }
}
exports.AuthorizationError = AuthorizationError;
class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404);
        this.name = 'NotFoundError';
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends AppError {
    constructor(message = 'Resource already exists') {
        super(message, 409);
        this.name = 'ConflictError';
    }
}
exports.ConflictError = ConflictError;
class OrganizationError extends AppError {
    constructor(message, statusCode = 400) {
        super(message, statusCode);
        this.name = 'OrganizationError';
    }
}
exports.OrganizationError = OrganizationError;
class OrganizationNotFoundError extends AppError {
    constructor(message = 'Organization not found') {
        super(message, 404);
        this.name = 'OrganizationNotFoundError';
    }
}
exports.OrganizationNotFoundError = OrganizationNotFoundError;
class DepartmentNotFoundError extends AppError {
    constructor(message = 'Department not found') {
        super(message, 404);
        this.name = 'DepartmentNotFoundError';
    }
}
exports.DepartmentNotFoundError = DepartmentNotFoundError;
class TeamNotFoundError extends AppError {
    constructor(message = 'Team not found') {
        super(message, 404);
        this.name = 'TeamNotFoundError';
    }
}
exports.TeamNotFoundError = TeamNotFoundError;
