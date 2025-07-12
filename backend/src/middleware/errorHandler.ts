import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger.js'

// Custom error class
export class AppError extends Error {
  public statusCode: number
  public isOperational: boolean

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

// Error handler middleware
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log the error
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  })

  // Default error values
  let statusCode = 500
  let message = 'Internal Server Error'
  let isOperational = false

  // Check if it's our custom AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode
    message = err.message
    isOperational = err.isOperational
  }

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400
    message = 'Validation Error'
  }

  if (err.name === 'CastError') {
    statusCode = 400
    message = 'Invalid ID format'
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401
    message = 'Invalid token'
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Token expired'
  }

  if (err.name === 'MulterError') {
    statusCode = 400
    message = 'File upload error'
  }

  // MongoDB duplicate key error
  if ((err as any).code === 11000) {
    statusCode = 409
    message = 'Duplicate resource'
  }

  // Construct error response
  const errorResponse: any = {
    error: {
      message,
      statusCode,
      timestamp: new Date().toISOString(),
    },
  }

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack
    errorResponse.error.details = err.message
  }

  // Send error response
  res.status(statusCode).json(errorResponse)
}

// Async error handler wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// Not found handler
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404)
  next(error)
}