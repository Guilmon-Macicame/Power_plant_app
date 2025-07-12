import { Router, Request, Response } from 'express'
import { asyncHandler } from '../middleware/errorHandler.js'
import { logger } from '../utils/logger.js'

const router = Router()

// Health check endpoint
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      ollama: 'unknown',
      chromadb: 'unknown',
      documentProcessor: 'unknown'
    },
    system: {
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      nodeVersion: process.version,
      platform: process.platform
    }
  }

  try {
    // Check Ollama service
    const ollamaService = req.app.locals.ollamaService
    if (ollamaService) {
      try {
        await ollamaService.testConnection()
        healthCheck.services.ollama = 'healthy'
      } catch (error) {
        healthCheck.services.ollama = 'unhealthy'
        logger.warn('Ollama service check failed:', error)
      }
    }

    // Check ChromaDB service
    const chromaService = req.app.locals.chromaService
    if (chromaService) {
      try {
        await chromaService.testConnection()
        healthCheck.services.chromadb = 'healthy'
      } catch (error) {
        healthCheck.services.chromadb = 'unhealthy'
        logger.warn('ChromaDB service check failed:', error)
      }
    }

    // Check Document service
    const documentService = req.app.locals.documentService
    if (documentService) {
      healthCheck.services.documentProcessor = 'healthy'
    }

    // Determine overall health
    const unhealthyServices = Object.values(healthCheck.services).filter(
      status => status === 'unhealthy'
    )
    
    if (unhealthyServices.length > 0) {
      healthCheck.status = 'degraded'
      res.status(503) // Service Unavailable
    } else {
      healthCheck.status = 'healthy'
      res.status(200)
    }

    res.json(healthCheck)
  } catch (error) {
    logger.error('Health check failed:', error)
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    })
  }
}))

// Detailed health check endpoint
router.get('/detailed', asyncHandler(async (req: Request, res: Response) => {
  const detailedHealth = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      ollama: {
        status: 'unknown',
        models: [],
        lastCheck: null
      },
      chromadb: {
        status: 'unknown',
        collections: [],
        lastCheck: null
      },
      documentProcessor: {
        status: 'unknown',
        supportedTypes: [],
        lastCheck: null
      }
    },
    system: {
      memory: {
        usage: process.memoryUsage(),
        free: 0,
        total: 0
      },
      cpu: process.cpuUsage(),
      nodeVersion: process.version,
      platform: process.platform,
      environment: process.env.NODE_ENV || 'development'
    }
  }

  try {
    // Detailed Ollama check
    const ollamaService = req.app.locals.ollamaService
    if (ollamaService) {
      try {
        await ollamaService.testConnection()
        detailedHealth.services.ollama.status = 'healthy'
        detailedHealth.services.ollama.models = await ollamaService.listModels()
        detailedHealth.services.ollama.lastCheck = new Date().toISOString()
      } catch (error) {
        detailedHealth.services.ollama.status = 'unhealthy'
        detailedHealth.services.ollama.lastCheck = new Date().toISOString()
        logger.warn('Detailed Ollama check failed:', error)
      }
    }

    // Detailed ChromaDB check
    const chromaService = req.app.locals.chromaService
    if (chromaService) {
      try {
        await chromaService.testConnection()
        detailedHealth.services.chromadb.status = 'healthy'
        detailedHealth.services.chromadb.collections = await chromaService.listCollections()
        detailedHealth.services.chromadb.lastCheck = new Date().toISOString()
      } catch (error) {
        detailedHealth.services.chromadb.status = 'unhealthy'
        detailedHealth.services.chromadb.lastCheck = new Date().toISOString()
        logger.warn('Detailed ChromaDB check failed:', error)
      }
    }

    // Detailed Document processor check
    const documentService = req.app.locals.documentService
    if (documentService) {
      detailedHealth.services.documentProcessor.status = 'healthy'
      detailedHealth.services.documentProcessor.supportedTypes = documentService.getSupportedTypes()
      detailedHealth.services.documentProcessor.lastCheck = new Date().toISOString()
    }

    // Add system memory info (if available)
    if (typeof process.memoryUsage === 'function') {
      const memUsage = process.memoryUsage()
      detailedHealth.system.memory.usage = memUsage
    }

    // Determine overall health
    const unhealthyServices = Object.values(detailedHealth.services).filter(
      service => service.status === 'unhealthy'
    )
    
    if (unhealthyServices.length > 0) {
      detailedHealth.status = 'degraded'
      res.status(503)
    } else {
      detailedHealth.status = 'healthy'
      res.status(200)
    }

    res.json(detailedHealth)
  } catch (error) {
    logger.error('Detailed health check failed:', error)
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Detailed health check failed'
    })
  }
}))

// Readiness probe endpoint
router.get('/ready', asyncHandler(async (req: Request, res: Response) => {
  try {
    // Check if all critical services are ready
    const ollamaService = req.app.locals.ollamaService
    const chromaService = req.app.locals.chromaService
    
    if (!ollamaService || !chromaService) {
      return res.status(503).json({
        ready: false,
        reason: 'Services not initialized'
      })
    }

    // Test connections
    await Promise.all([
      ollamaService.testConnection(),
      chromaService.testConnection()
    ])

    res.json({
      ready: true,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    logger.warn('Readiness check failed:', error)
    res.status(503).json({
      ready: false,
      reason: 'Service unavailable',
      timestamp: new Date().toISOString()
    })
  }
}))

// Liveness probe endpoint
router.get('/live', asyncHandler(async (req: Request, res: Response) => {
  res.json({
    alive: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
}))

export default router