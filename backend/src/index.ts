import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

// Import route handlers
import chatRoutes from './routes/chat.js'
import troubleshootingRoutes from './routes/troubleshooting.js'
import documentRoutes from './routes/documents.js'
import adminRoutes from './routes/admin.js'
import healthRoutes from './routes/health.js'

// Import middleware
import { errorHandler } from './middleware/errorHandler.js'
import { rateLimiter } from './middleware/rateLimiter.js'
import { requestLogger } from './middleware/requestLogger.js'

// Import services
import { OllamaService } from './services/ollamaService.js'
import { ChromaService } from './services/chromaService.js'
import { DocumentService } from './services/documentService.js'
import { logger } from './utils/logger.js'

// ES module compatibility
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config()

// Validate required environment variables
const requiredEnvVars = [
  'PORT',
  'OLLAMA_HOST',
  'OLLAMA_PORT',
  'CHROMADB_HOST',
  'CHROMADB_PORT',
  'CHROMADB_COLLECTION_NAME'
]

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName])
if (missingEnvVars.length > 0) {
  logger.error('Missing required environment variables:', missingEnvVars)
  process.exit(1)
}

// Create Express application
const app = express()
const PORT = process.env.PORT || 5000

// Global middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for development
  crossOriginEmbedderPolicy: false
}))

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-production-domain.com'] 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(compression())
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }))
app.use(express.json({ limit: '100mb' }))
app.use(express.urlencoded({ extended: true, limit: '100mb' }))

// Custom middleware
app.use(requestLogger)
app.use(rateLimiter)

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// Health check endpoint
app.use('/api/health', healthRoutes)

// API routes
app.use('/api/chat', chatRoutes)
app.use('/api/troubleshooting', troubleshootingRoutes)
app.use('/api/documents', documentRoutes)
app.use('/api/admin', adminRoutes)

// Default route
app.get('/', (req, res) => {
  res.json({
    message: 'Power Plant Troubleshooting API',
    version: '1.0.0',
    status: 'online',
    timestamp: new Date().toISOString()
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  })
})

// Error handling middleware (must be last)
app.use(errorHandler)

// Initialize services
async function initializeServices() {
  try {
    logger.info('Initializing services...')
    
    // Initialize Ollama service
    const ollamaService = new OllamaService({
      host: process.env.OLLAMA_HOST!,
      port: parseInt(process.env.OLLAMA_PORT!),
      chatModel: process.env.OLLAMA_MODEL_CHAT || 'llama3.2:3b',
      embeddingModel: process.env.OLLAMA_MODEL_EMBEDDING || 'nomic-embed-text:v1.5',
      visionModel: process.env.OLLAMA_MODEL_VISION || 'llava'
    })

    // Test Ollama connection
    await ollamaService.testConnection()
    logger.info('Ollama service initialized successfully')

    // Initialize ChromaDB service
    const chromaService = new ChromaService({
      host: process.env.CHROMADB_HOST!,
      port: parseInt(process.env.CHROMADB_PORT!),
      collectionName: process.env.CHROMADB_COLLECTION_NAME!
    })

    // Test ChromaDB connection
    await chromaService.testConnection()
    logger.info('ChromaDB service initialized successfully')

    // Initialize Document service
    const documentService = new DocumentService({
      uploadDir: process.env.UPLOAD_DIR || 'uploads',
      maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '104857600'), // 100MB
      allowedTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || ['pdf', 'docx', 'txt', 'png', 'jpg', 'jpeg']
    })

    // Make services available globally
    app.locals.ollamaService = ollamaService
    app.locals.chromaService = chromaService
    app.locals.documentService = documentService

    logger.info('All services initialized successfully')
  } catch (error) {
    logger.error('Failed to initialize services:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, starting graceful shutdown...')
  
  // Close services
  try {
    if (app.locals.chromaService) {
      await app.locals.chromaService.close()
    }
    logger.info('Services closed successfully')
  } catch (error) {
    logger.error('Error during shutdown:', error)
  }
  
  process.exit(0)
})

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, starting graceful shutdown...')
  
  // Close services
  try {
    if (app.locals.chromaService) {
      await app.locals.chromaService.close()
    }
    logger.info('Services closed successfully')
  } catch (error) {
    logger.error('Error during shutdown:', error)
  }
  
  process.exit(0)
})

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error)
  process.exit(1)
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

// Start server
async function startServer() {
  try {
    await initializeServices()
    
    app.listen(PORT, () => {
      logger.info(`🚀 Power Plant Troubleshooting API Server running on port ${PORT}`)
      logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
      logger.info(`🔧 Ollama: ${process.env.OLLAMA_HOST}:${process.env.OLLAMA_PORT}`)
      logger.info(`📚 ChromaDB: ${process.env.CHROMADB_HOST}:${process.env.CHROMADB_PORT}`)
      logger.info(`📁 Upload directory: ${process.env.UPLOAD_DIR || 'uploads'}`)
      
      if (process.env.NODE_ENV === 'development') {
        logger.info(`🌐 API Documentation: http://localhost:${PORT}`)
        logger.info(`🏥 Health Check: http://localhost:${PORT}/api/health`)
      }
    })
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Start the server
startServer()

export default app