export class AppError extends Error {
	public statusCode: number;
	public isOperational: boolean;

	constructor(message: string, statusCode: number) {
		super(message);
		this.statusCode = statusCode;
		this.isOperational = true;
		Error.captureStackTrace(this, this.constructor);
	}
}

export class NotFoundError extends AppError {
	constructor(message = "Resource not found") {
		super(message, 404);
	}
}

export class UnauthorizedError extends AppError {
	constructor(message = "Unauthorized access") {
		super(message, 401);
	}
}

export class ForbiddenError extends AppError {
	constructor(message = "Forbidden access") {
		super(message, 403);
	}
}

export class ValidationError extends AppError {
	constructor(message = "Validation failed") {
		super(message, 400);
	}
}

export class DatabaseError extends AppError {
	constructor(message = "Database operation failed") {
		super(message, 500);
	}
}
