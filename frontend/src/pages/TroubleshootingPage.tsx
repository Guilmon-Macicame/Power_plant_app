import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  AlertTriangle, 
  FileText, 
  Camera,
  Download,
  Bookmark,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react'
import toast from 'react-hot-toast'

interface TroubleshootingStep {
  id: string
  title: string
  description: string
  type: 'instruction' | 'check' | 'decision' | 'measurement'
  content: string
  image?: string
  options?: {
    id: string
    text: string
    next: string
  }[]
  measurements?: {
    parameter: string
    expected: string
    unit: string
  }[]
  completed: boolean
  result?: string
}

const TroubleshootingPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [steps, setSteps] = useState<TroubleshootingStep[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const engine = searchParams.get('engine')
  const alarm = searchParams.get('alarm')
  const description = searchParams.get('description')

  useEffect(() => {
    // Load troubleshooting steps from API
    loadTroubleshootingSteps()
  }, [engine, alarm, description])

  const loadTroubleshootingSteps = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/troubleshooting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          engine,
          alarm,
          description
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to load troubleshooting steps')
      }

      const data = await response.json()
      setSteps(data.steps || getSampleSteps())
    } catch (error) {
      console.error('Error loading troubleshooting steps:', error)
      setSteps(getSampleSteps())
      toast.error('Using sample troubleshooting steps')
    } finally {
      setIsLoading(false)
    }
  }

  const getSampleSteps = (): TroubleshootingStep[] => [
    {
      id: 'initial-safety',
      title: 'Safety Check',
      description: 'Ensure all safety protocols are followed',
      type: 'check',
      content: 'Before proceeding with any troubleshooting activities, ensure that all safety protocols are in place:\n\n• Proper PPE is worn\n• Lockout/Tagout procedures are followed\n• Area is secured and personnel are notified\n• Emergency stop procedures are understood',
      completed: false
    },
    {
      id: 'visual-inspection',
      title: 'Visual Inspection',
      description: 'Perform initial visual inspection of the engine',
      type: 'instruction',
      content: 'Conduct a thorough visual inspection of the engine and surrounding area:\n\n• Check for obvious leaks (oil, coolant, fuel)\n• Inspect for damaged or loose components\n• Look for abnormal wear patterns\n• Check electrical connections\n• Verify proper mounting and alignment',
      completed: false
    },
    {
      id: 'parameter-check',
      title: 'Parameter Measurement',
      description: 'Measure critical engine parameters',
      type: 'measurement',
      content: 'Use appropriate instruments to measure the following parameters:',
      measurements: [
        { parameter: 'Oil Pressure', expected: '40-60', unit: 'psi' },
        { parameter: 'Coolant Temperature', expected: '160-200', unit: '°F' },
        { parameter: 'Vibration Level', expected: '<5', unit: 'mm/s' },
        { parameter: 'Fuel Pressure', expected: '25-35', unit: 'psi' }
      ],
      completed: false
    },
    {
      id: 'decision-point',
      title: 'Initial Assessment',
      description: 'Based on your findings, choose the next course of action',
      type: 'decision',
      content: 'Based on your visual inspection and parameter measurements, what did you observe?',
      options: [
        { id: 'normal', text: 'All parameters within normal range', next: 'advanced-diagnostics' },
        { id: 'oil-issue', text: 'Oil pressure or quality issues', next: 'oil-system-check' },
        { id: 'temperature', text: 'Temperature abnormalities', next: 'cooling-system-check' },
        { id: 'vibration', text: 'Excessive vibration', next: 'mechanical-inspection' }
      ],
      completed: false
    },
    {
      id: 'advanced-diagnostics',
      title: 'Advanced Diagnostics',
      description: 'Perform detailed diagnostic procedures',
      type: 'instruction',
      content: 'Since basic parameters appear normal, proceed with advanced diagnostics:\n\n• Connect diagnostic equipment\n• Run engine performance tests\n• Check for fault codes\n• Analyze exhaust emissions\n• Review historical data trends',
      completed: false
    }
  ]

  const handleStepComplete = (stepId: string, result?: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, completed: true, result }
        : step
    ))
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleOptionSelect = (optionId: string) => {
    const currentStepData = steps[currentStep]
    const selectedOption = currentStepData.options?.find(opt => opt.id === optionId)
    
    if (selectedOption) {
      handleStepComplete(currentStepData.id, selectedOption.text)
      // In a real implementation, this would navigate to the next step based on the option
      toast.success(`Selected: ${selectedOption.text}`)
      handleNext()
    }
  }

  const exportReport = () => {
    const reportContent = steps.map(step => {
      let content = `${step.title}\n${'='.repeat(step.title.length)}\n\n${step.description}\n\n${step.content}\n\n`
      
      if (step.completed) {
        content += `Status: Completed\n`
        if (step.result) {
          content += `Result: ${step.result}\n`
        }
      } else {
        content += `Status: Not completed\n`
      }
      
      return content + '\n'
    }).join('')
    
    const blob = new Blob([reportContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `troubleshooting-report-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'check':
        return <CheckCircle className="w-5 h-5" />
      case 'instruction':
        return <FileText className="w-5 h-5" />
      case 'decision':
        return <AlertTriangle className="w-5 h-5" />
      case 'measurement':
        return <Info className="w-5 h-5" />
      default:
        return <FileText className="w-5 h-5" />
    }
  }

  const getStepColor = (type: string) => {
    switch (type) {
      case 'check':
        return 'text-green-600'
      case 'instruction':
        return 'text-blue-600'
      case 'decision':
        return 'text-orange-600'
      case 'measurement':
        return 'text-purple-600'
      default:
        return 'text-gray-600'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading troubleshooting workflow...</p>
        </div>
      </div>
    )
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
              <motion.button
                onClick={() => navigate('/dashboard')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </motion.button>
              
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Troubleshooting Workflow
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Step-by-step diagnostic guidance
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <motion.button
                onClick={exportReport}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Export Report"
              >
                <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Bookmark"
              >
                <Bookmark className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Progress Bar */}
      <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-primary h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Step Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Steps
              </h3>
              <div className="space-y-2">
                {steps.map((step, index) => (
                  <motion.button
                    key={step.id}
                    onClick={() => setCurrentStep(index)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      index === currentStep
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : step.completed
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                        : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`${getStepColor(step.type)} ${step.completed ? 'text-green-600' : ''}`}>
                        {step.completed ? <Check className="w-4 h-4" /> : getStepIcon(step.type)}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium truncate">
                          {step.title}
                        </div>
                        <div className="text-xs opacity-75 truncate">
                          {step.description}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700"
              >
                {steps[currentStep] && (
                  <div>
                    <div className="flex items-center space-x-3 mb-6">
                      <div className={`p-3 rounded-lg ${getStepColor(steps[currentStep].type)} bg-current/10`}>
                        {getStepIcon(steps[currentStep].type)}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                          {steps[currentStep].title}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                          {steps[currentStep].description}
                        </p>
                      </div>
                    </div>

                    <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300 mb-8">
                      <div className="whitespace-pre-line">
                        {steps[currentStep].content}
                      </div>
                    </div>

                    {/* Measurements Table */}
                    {steps[currentStep].measurements && (
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                          Required Measurements
                        </h3>
                        <div className="overflow-x-auto">
                          <table className="w-full bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Parameter
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Expected Range
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Unit
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                  Actual Value
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                              {steps[currentStep].measurements?.map((measurement, index) => (
                                <tr key={index}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                    {measurement.parameter}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {measurement.expected} {measurement.unit}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {measurement.unit}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <input
                                      type="text"
                                      placeholder="Enter value"
                                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Decision Options */}
                    {steps[currentStep].options && (
                      <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                          Choose Next Action
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {steps[currentStep].options?.map((option) => (
                            <motion.button
                              key={option.id}
                              onClick={() => handleOptionSelect(option.id)}
                              className="p-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-left"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="font-medium text-gray-900 dark:text-white">
                                {option.text}
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between">
                      <motion.button
                        onClick={handlePrevious}
                        disabled={currentStep === 0}
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Previous</span>
                      </motion.button>

                      <div className="flex items-center space-x-4">
                        <motion.button
                          onClick={() => handleStepComplete(steps[currentStep].id)}
                          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Check className="w-4 h-4" />
                          <span>Mark Complete</span>
                        </motion.button>

                        <motion.button
                          onClick={handleNext}
                          disabled={currentStep === steps.length - 1}
                          className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <span>Next</span>
                          <ArrowRight className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TroubleshootingPage