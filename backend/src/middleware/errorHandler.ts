import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = "Validation failed") {
    super(message, 400);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = "Bad request") {
    super(message, 400);
  }
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error("Error:", err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        statusCode: err.statusCode,
      },
    });
    return;
  }

  // Prisma errors
  if (err.name === "PrismaClientKnownRequestError") {
    res.status(400).json({
      success: false,
      error: {
        message: "Database operation failed",
        statusCode: 400,
      },
    });
    return;
  }

  // Zod validation errors
  if (err.name === "ZodError") {
    res.status(400).json({
      success: false,
      error: {
        message: "Validation failed",
        statusCode: 400,
        details: err,
      },
    });
    return;
  }

  // Default error
  res.status(500).json({
    success: false,
    error: {
      message:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : err.message,
      statusCode: 500,
    },
  });
};
