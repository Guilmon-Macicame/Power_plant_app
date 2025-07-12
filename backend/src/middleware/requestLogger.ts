import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger.js'

// Request logger middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now()
  
  // Log request details
  logger.info(`Incoming request: ${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    contentType: req.get('Content-Type'),
    contentLength: req.get('Content-Length'),
    timestamp: new Date().toISOString(),
  })

  // Override the end method to log response details
  const originalEnd = res.end
  res.end = function (chunk?: any, encoding?: any) {
    const endTime = Date.now()
    const duration = endTime - startTime
    
    logger.info(`Response sent: ${req.method} ${req.originalUrl}`, {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString(),
    })
    
    originalEnd.call(this, chunk, encoding)
  }
  
  next()
}

// API-specific request logger
export const apiRequestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now()
  
  // Log API request details
  logger.info(`API Request: ${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.method === 'POST' || req.method === 'PUT' ? req.body : undefined,
    query: req.query,
    params: req.params,
    timestamp: new Date().toISOString(),
  })

  // Override the json method to log response body
  const originalJson = res.json
  res.json = function (body?: any) {
    const endTime = Date.now()
    const duration = endTime - startTime
    
    logger.info(`API Response: ${req.method} ${req.originalUrl}`, {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      responseBody: body,
      ip: req.ip,
      timestamp: new Date().toISOString(),
    })
    
    return originalJson.call(this, body)
  }
  
  next()
}

// Error request logger
export const errorRequestLogger = (req: Request, res: Response, next: NextFunction) => {
  // Log error-prone requests
  if (req.originalUrl.includes('/api/')) {
    logger.debug(`API Request received: ${req.method} ${req.originalUrl}`, {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      headers: req.headers,
      body: req.body,
      query: req.query,
      params: req.params,
      timestamp: new Date().toISOString(),
    })
  }
  
  next()
}