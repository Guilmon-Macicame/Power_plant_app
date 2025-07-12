import { Request, Response, NextFunction } from 'express'
import { RateLimiterMemory } from 'rate-limiter-flexible'
import { logger } from '../utils/logger.js'

// Rate limiter options
const rateLimiterOptions = {
  keyGenerator: (req: Request) => req.ip, // Use IP as key
  points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // Number of requests
  duration: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900'), // Per 15 minutes (900 seconds)
  blockDuration: 60, // Block for 60 seconds if limit exceeded
}

// Create rate limiter instance
const rateLimiter = new RateLimiterMemory(rateLimiterOptions)

// Rate limiting middleware
export const rateLimiterMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Apply rate limiting
    await rateLimiter.consume(req.ip)
    next()
  } catch (rateLimiterRes) {
    // Rate limit exceeded
    const remainingTime = Math.round(rateLimiterRes.msBeforeNext / 1000) || 1
    
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`, {
      ip: req.ip,
      url: req.originalUrl,
      method: req.method,
      userAgent: req.get('User-Agent'),
      remainingTime,
    })

    res.status(429).json({
      error: {
        message: 'Too Many Requests',
        statusCode: 429,
        retryAfter: remainingTime,
        timestamp: new Date().toISOString(),
      },
    })
  }
}

// Stricter rate limiter for auth endpoints
const authRateLimiter = new RateLimiterMemory({
  keyGenerator: (req: Request) => req.ip,
  points: 5, // 5 requests
  duration: 900, // Per 15 minutes
  blockDuration: 900, // Block for 15 minutes
})

// Auth rate limiting middleware
export const authRateLimiterMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await authRateLimiter.consume(req.ip)
    next()
  } catch (rateLimiterRes) {
    const remainingTime = Math.round(rateLimiterRes.msBeforeNext / 1000) || 1
    
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`, {
      ip: req.ip,
      url: req.originalUrl,
      method: req.method,
      userAgent: req.get('User-Agent'),
      remainingTime,
    })

    res.status(429).json({
      error: {
        message: 'Too Many Authentication Attempts',
        statusCode: 429,
        retryAfter: remainingTime,
        timestamp: new Date().toISOString(),
      },
    })
  }
}

// File upload rate limiter
const uploadRateLimiter = new RateLimiterMemory({
  keyGenerator: (req: Request) => req.ip,
  points: 10, // 10 uploads
  duration: 3600, // Per hour
  blockDuration: 3600, // Block for 1 hour
})

// Upload rate limiting middleware
export const uploadRateLimiterMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await uploadRateLimiter.consume(req.ip)
    next()
  } catch (rateLimiterRes) {
    const remainingTime = Math.round(rateLimiterRes.msBeforeNext / 1000) || 1
    
    logger.warn(`Upload rate limit exceeded for IP: ${req.ip}`, {
      ip: req.ip,
      url: req.originalUrl,
      method: req.method,
      userAgent: req.get('User-Agent'),
      remainingTime,
    })

    res.status(429).json({
      error: {
        message: 'Too Many File Uploads',
        statusCode: 429,
        retryAfter: remainingTime,
        timestamp: new Date().toISOString(),
      },
    })
  }
}

// Export the default rate limiter
export { rateLimiterMiddleware as rateLimiter }