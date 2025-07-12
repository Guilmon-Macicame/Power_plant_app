import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  Settings, 
  Users, 
  Database, 
  Activity, 
  Download, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  Edit,
  BarChart3,
  PieChart,
  TrendingUp,
  Server,
  HardDrive
} from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'

interface Document {
  id: string
  name: string
  type: string
  size: number
  status: 'processing' | 'completed' | 'failed'
  uploadDate: string
  embeddings: number
}

interface SystemMetrics {
  totalDocuments: number
  totalEmbeddings: number
  activeUsers: number
  systemLoad: number
  memoryUsage: number
  diskUsage: number
  apiCalls: number
  errors: number
}

interface LLMModel {
  id: string
  name: string
  type: 'chat' | 'embedding' | 'vision'
  status: 'active' | 'inactive' | 'loading'
  lastUsed: string
  usage: number
}

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'documents' | 'system' | 'analytics' | 'users'>('documents')
  const [documents, setDocuments] = useState<Document[]>([])
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    totalDocuments: 42,
    totalEmbeddings: 1240,
    activeUsers: 8,
    systemLoad: 65,
    memoryUsage: 45,
    diskUsage: 78,
    apiCalls: 1850,
    errors: 12
  })
  const [llmModels, setLlmModels] = useState<LLMModel[]>([
    {
      id: 'llama3.2-3b',
      name: 'Llama 3.2 3B',
      type: 'chat',
      status: 'active',
      lastUsed: '2024-01-15T10:30:00Z',
      usage: 85
    },
    {
      id: 'nomic-embed',
      name: 'Nomic Embed Text v1.5',
      type: 'embedding',
      status: 'active',
      lastUsed: '2024-01-15T10:25:00Z',
      usage: 70
    },
    {
      id: 'llava',
      name: 'LLaVA Vision Model',
      type: 'vision',
      status: 'inactive',
      lastUsed: '2024-01-14T16:45:00Z',
      usage: 15
    }
  ])
  const [isUploading, setIsUploading] = useState(false)
  const navigate = useNavigate()

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    onDrop: handleFileUpload
  })

  useEffect(() => {
    // Load documents from API
    loadDocuments()
    
    // Set up real-time updates
    const interval = setInterval(() => {
      updateSystemMetrics()
    }, 30000) // Update every 30 seconds
    
    return () => clearInterval(interval)
  }, [])

  const loadDocuments = async () => {
    try {
      const response = await fetch('/api/admin/documents')
      if (response.ok) {
        const data = await response.json()
        setDocuments(data.documents || getSampleDocuments())
      }
    } catch (error) {
      console.error('Error loading documents:', error)
      setDocuments(getSampleDocuments())
    }
  }

  const getSampleDocuments = (): Document[] => [
    {
      id: '1',
      name: 'Gas Turbine Maintenance Manual.pdf',
      type: 'pdf',
      size: 15680000,
      status: 'completed',
      uploadDate: '2024-01-10T14:30:00Z',
      embeddings: 450
    },
    {
      id: '2',
      name: 'Safety Procedures.docx',
      type: 'docx',
      size: 3200000,
      status: 'completed',
      uploadDate: '2024-01-12T09:15:00Z',
      embeddings: 120
    },
    {
      id: '3',
      name: 'Troubleshooting Guide.pdf',
      type: 'pdf',
      size: 8900000,
      status: 'processing',
      uploadDate: '2024-01-15T11:45:00Z',
      embeddings: 0
    }
  ]

  function handleFileUpload(acceptedFiles: File[]) {
    setIsUploading(true)
    
    acceptedFiles.forEach(file => {
      const newDocument: Document = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        size: file.size,
        status: 'processing',
        uploadDate: new Date().toISOString(),
        embeddings: 0
      }
      
      setDocuments(prev => [...prev, newDocument])
      
      // Simulate upload and processing
      setTimeout(() => {
        setDocuments(prev => prev.map(doc => 
          doc.id === newDocument.id 
            ? { ...doc, status: 'completed', embeddings: Math.floor(Math.random() * 200) + 50 }
            : doc
        ))
        toast.success(`${file.name} processed successfully`)
      }, 3000)
    })
    
    setIsUploading(false)
  }

  const updateSystemMetrics = () => {
    setSystemMetrics(prev => ({
      ...prev,
      systemLoad: Math.max(30, Math.min(90, prev.systemLoad + (Math.random() - 0.5) * 10)),
      memoryUsage: Math.max(20, Math.min(80, prev.memoryUsage + (Math.random() - 0.5) * 5)),
      apiCalls: prev.apiCalls + Math.floor(Math.random() * 50),
      errors: prev.errors + (Math.random() > 0.8 ? 1 : 0)
    }))
  }

  const handleDeleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id))
    toast.success('Document deleted successfully')
  }

  const handleModelToggle = (id: string) => {
    setLlmModels(prev => prev.map(model => 
      model.id === id 
        ? { ...model, status: model.status === 'active' ? 'inactive' : 'active' }
        : model
    ))
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'processing':
        return <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />
    }
  }

  const renderDocuments = () => (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Upload Documents</h3>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-primary bg-primary/10'
              : 'border-gray-300 dark:border-gray-600 hover:border-primary'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Or click to select files • PDF, DOCX, TXT, Images • Max 100MB
          </p>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Documents</h3>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {documents.length} documents • {documents.reduce((acc, doc) => acc + doc.embeddings, 0)} embeddings
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Size</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Embeddings</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Uploaded</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-gray-500" />
                      <span className="font-medium text-gray-900 dark:text-white">{doc.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                    {formatFileSize(doc.size)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(doc.status)}
                      <span className={`text-sm font-medium ${
                        doc.status === 'completed' ? 'text-green-600' :
                        doc.status === 'processing' ? 'text-blue-600' :
                        'text-red-600'
                      }`}>
                        {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                    {doc.embeddings}
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                    {new Date(doc.uploadDate).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-1 rounded text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-1 rounded text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        onClick={() => handleDeleteDocument(doc.id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-1 rounded text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderSystem = () => (
    <div className="space-y-6">
      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">System Load</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{systemMetrics.systemLoad}%</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${systemMetrics.systemLoad}%` }}
            />
          </div>
        </div>

        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Memory Usage</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{systemMetrics.memoryUsage}%</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <Server className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${systemMetrics.memoryUsage}%` }}
            />
          </div>
        </div>

        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Disk Usage</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{systemMetrics.diskUsage}%</p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <HardDrive className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${systemMetrics.diskUsage}%` }}
            />
          </div>
        </div>

        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{systemMetrics.activeUsers}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* LLM Models */}
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">LLM Models</h3>
        <div className="space-y-4">
          {llmModels.map((model) => (
            <div key={model.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${
                  model.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                }`} />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{model.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {model.type} • Last used: {new Date(model.lastUsed).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{model.usage}%</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Usage</p>
                </div>
                <motion.button
                  onClick={() => handleModelToggle(model.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    model.status === 'active'
                      ? 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200'
                      : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-200'
                  }`}
                >
                  {model.status === 'active' ? 'Deactivate' : 'Activate'}
                </motion.button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">API Usage</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total API Calls</span>
              <span className="font-bold text-gray-900 dark:text-white">{systemMetrics.apiCalls}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Errors</span>
              <span className="font-bold text-red-600">{systemMetrics.errors}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Success Rate</span>
              <span className="font-bold text-green-600">
                {((systemMetrics.apiCalls - systemMetrics.errors) / systemMetrics.apiCalls * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Document Statistics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Documents</span>
              <span className="font-bold text-gray-900 dark:text-white">{systemMetrics.totalDocuments}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Embeddings</span>
              <span className="font-bold text-gray-900 dark:text-white">{systemMetrics.totalEmbeddings}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Avg. Embeddings/Doc</span>
              <span className="font-bold text-gray-900 dark:text-white">
                {Math.round(systemMetrics.totalEmbeddings / systemMetrics.totalDocuments)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const tabs = [
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'system', label: 'System', icon: Settings },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <motion.button
                onClick={() => navigate('/dashboard')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </motion.button>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Settings className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Admin Control Panel
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    System management and configuration
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">System Online</span>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Navigation Tabs */}
      <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </motion.button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'documents' && renderDocuments()}
          {activeTab === 'system' && renderSystem()}
          {activeTab === 'analytics' && renderAnalytics()}
          {activeTab === 'users' && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 dark:text-gray-400">User management coming soon</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default AdminPage