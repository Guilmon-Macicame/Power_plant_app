import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../contexts/ThemeContext'
import { 
  Power, 
  MessageSquare, 
  Settings, 
  Search, 
  BarChart3, 
  GitBranch, 
  History, 
  Sun, 
  Moon, 
  LogOut, 
  Bell,
  ChevronDown,
  AlertTriangle,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

const Dashboard: React.FC = () => {
  const [selectedEngine, setSelectedEngine] = useState('Engine_001')
  const [alarmType, setAlarmType] = useState('')
  const [failureDescription, setFailureDescription] = useState('')
  const [isEngineDropdownOpen, setIsEngineDropdownOpen] = useState(false)
  
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const engines = [
    { id: 'Engine_001', name: 'Gas Turbine GT001', status: 'operational', temperature: '650°C' },
    { id: 'Engine_002', name: 'Steam Turbine ST002', status: 'warning', temperature: '720°C' },
    { id: 'Engine_003', name: 'Gas Turbine GT003', status: 'maintenance', temperature: '590°C' },
    { id: 'Engine_004', name: 'Steam Turbine ST004', status: 'operational', temperature: '680°C' },
  ]

  const alarmTypes = [
    { id: 'vibration', name: 'Vibration', icon: '🔴', color: 'bg-red-500' },
    { id: 'temperature', name: 'Temperature', icon: '🟠', color: 'bg-orange-500' },
    { id: 'pressure', name: 'Pressure', icon: '🟡', color: 'bg-yellow-500' },
    { id: 'lubrication', name: 'Lubrication', icon: '🟢', color: 'bg-green-500' },
    { id: 'electrical', name: 'Electrical', icon: '🔵', color: 'bg-blue-500' },
  ]

  const actionButtons = [
    {
      id: 'troubleshoot',
      title: 'Troubleshoot',
      description: 'AI-powered diagnostic assistance',
      icon: Settings,
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'from-blue-600 to-blue-700',
      route: '/troubleshooting'
    },
    {
      id: 'rca',
      title: 'Root Cause Analysis',
      description: 'Deep dive into failure causes',
      icon: Search,
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'from-purple-600 to-purple-700',
      route: '/chat?mode=rca'
    },
    {
      id: 'fmea',
      title: 'FMEA Analysis',
      description: 'Failure mode and effects analysis',
      icon: BarChart3,
      color: 'from-green-500 to-green-600',
      hoverColor: 'from-green-600 to-green-700',
      route: '/chat?mode=fmea'
    },
    {
      id: 'fishbone',
      title: 'Fishbone Diagram',
      description: 'Visual cause and effect analysis',
      icon: GitBranch,
      color: 'from-orange-500 to-orange-600',
      hoverColor: 'from-orange-600 to-orange-700',
      route: '/chat?mode=fishbone'
    },
    {
      id: 'historical',
      title: 'Historical Data',
      description: 'Past incidents and solutions',
      icon: History,
      color: 'from-teal-500 to-teal-600',
      hoverColor: 'from-teal-600 to-teal-700',
      route: '/chat?mode=historical'
    },
    {
      id: 'chat',
      title: 'AI Assistant',
      description: 'General troubleshooting chat',
      icon: MessageSquare,
      color: 'from-indigo-500 to-indigo-600',
      hoverColor: 'from-indigo-600 to-indigo-700',
      route: '/chat'
    },
  ]

  const getEngineStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case 'maintenance':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <CheckCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const handleActionClick = (route: string) => {
    if (!selectedEngine || !failureDescription.trim()) {
      toast.error('Please select an engine and describe the failure')
      return
    }
    
    const params = new URLSearchParams({
      engine: selectedEngine,
      alarm: alarmType,
      description: failureDescription
    })
    
    navigate(`${route}?${params}`)
  }

  const handleLogout = async () => {
    try {
      await signOut()
      toast.success('Logged out successfully')
    } catch (error) {
      toast.error('Failed to logout')
    }
  }

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
              <div className="p-2 bg-primary/10 rounded-lg">
                <Power className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Power Plant Diagnostics
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Welcome back, {user?.email}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </motion.button>
              
              <motion.button
                onClick={toggleTheme}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
              </motion.button>
              
              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <LogOut className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Configuration Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
              Engine Configuration
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Engine Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select Engine
                </label>
                <div className="relative">
                  <motion.button
                    onClick={() => setIsEngineDropdownOpen(!isEngineDropdownOpen)}
                    className="w-full flex items-center justify-between p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary transition-colors"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center space-x-3">
                      {getEngineStatusIcon(engines.find(e => e.id === selectedEngine)?.status || 'operational')}
                      <span className="text-gray-900 dark:text-white">
                        {engines.find(e => e.id === selectedEngine)?.name || 'Select Engine'}
                      </span>
                    </div>
                    <ChevronDown className={`w-5 h-5 transition-transform ${isEngineDropdownOpen ? 'rotate-180' : ''}`} />
                  </motion.button>
                  
                  {isEngineDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-10"
                    >
                      {engines.map((engine) => (
                        <button
                          key={engine.id}
                          onClick={() => {
                            setSelectedEngine(engine.id)
                            setIsEngineDropdownOpen(false)
                          }}
                          className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            {getEngineStatusIcon(engine.status)}
                            <div className="text-left">
                              <div className="text-gray-900 dark:text-white font-medium">
                                {engine.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {engine.temperature}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Alarm Type */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Alarm Type
                </label>
                <select
                  value={alarmType}
                  onChange={(e) => setAlarmType(e.target.value)}
                  className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                >
                  <option value="">Select alarm type</option>
                  {alarmTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.icon} {type.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Failure Description */}
              <div className="space-y-2 md:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Failure Description
                </label>
                <textarea
                  value={failureDescription}
                  onChange={(e) => setFailureDescription(e.target.value)}
                  placeholder="Describe the issue or symptoms..."
                  className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
                  rows={3}
                />
              </div>
            </div>
          </div>
        </motion.section>

        {/* Action Buttons */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
            Diagnostic Tools
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {actionButtons.map((button, index) => (
              <motion.div
                key={button.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleActionClick(button.route)}
                className={`relative p-6 rounded-2xl cursor-pointer overflow-hidden group bg-gradient-to-br ${button.color} hover:${button.hoverColor} transition-all duration-300 shadow-lg hover:shadow-xl`}
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-white/20 rounded-lg">
                      <button.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="w-2 h-2 bg-white/40 rounded-full group-hover:bg-white/60 transition-colors" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {button.title}
                  </h3>
                  
                  <p className="text-white/80 text-sm">
                    {button.description}
                  </p>
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Quick Stats */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Engines</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">4</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Power className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Operational</p>
                  <p className="text-2xl font-bold text-green-600">2</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Warnings</p>
                  <p className="text-2xl font-bold text-yellow-600">1</p>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Maintenance</p>
                  <p className="text-2xl font-bold text-red-600">1</p>
                </div>
                <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  )
}

export default Dashboard