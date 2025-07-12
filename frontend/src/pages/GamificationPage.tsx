import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Trophy, 
  Target, 
  Clock, 
  Star, 
  Award, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Play,
  Pause,
  Users,
  TrendingUp,
  Book,
  Zap
} from 'lucide-react'
import toast from 'react-hot-toast'

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correct: number
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
}

interface Challenge {
  id: string
  title: string
  description: string
  type: 'quiz' | 'drag-drop' | 'simulation'
  difficulty: 'easy' | 'medium' | 'hard'
  points: number
  completed: boolean
  icon: React.ReactNode
}

interface UserProgress {
  totalPoints: number
  level: number
  completedChallenges: number
  achievements: string[]
  streak: number
}

const GamificationPage: React.FC = () => {
  const [currentView, setCurrentView] = useState<'overview' | 'quiz' | 'challenge' | 'leaderboard'>('overview')
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [quizScore, setQuizScore] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(30)
  const [isQuizActive, setIsQuizActive] = useState(false)
  const [userProgress, setUserProgress] = useState<UserProgress>({
    totalPoints: 1250,
    level: 5,
    completedChallenges: 12,
    achievements: ['First Steps', 'Quiz Master', 'Safety Champion'],
    streak: 7
  })

  const navigate = useNavigate()

  const sampleQuestions: QuizQuestion[] = [
    {
      id: '1',
      question: 'What is the normal oil pressure range for a gas turbine engine?',
      options: ['20-30 psi', '40-60 psi', '80-100 psi', '120-140 psi'],
      correct: 1,
      explanation: 'Gas turbine engines typically operate with oil pressure between 40-60 psi under normal conditions.',
      difficulty: 'medium'
    },
    {
      id: '2',
      question: 'Which of the following is NOT a common cause of engine vibration?',
      options: ['Imbalanced rotor', 'Worn bearings', 'Misalignment', 'High fuel pressure'],
      correct: 3,
      explanation: 'High fuel pressure typically affects combustion efficiency but does not directly cause mechanical vibration.',
      difficulty: 'easy'
    },
    {
      id: '3',
      question: 'What does FMEA stand for in maintenance practices?',
      options: ['Failure Mode and Effects Analysis', 'Functional Maintenance Evaluation Assessment', 'Fault Management and Emergency Actions', 'Frequency Measurement and Error Analysis'],
      correct: 0,
      explanation: 'FMEA stands for Failure Mode and Effects Analysis, a systematic approach to identifying and preventing failures.',
      difficulty: 'medium'
    }
  ]

  const challenges: Challenge[] = [
    {
      id: 'safety-quiz',
      title: 'Safety Protocol Quiz',
      description: 'Test your knowledge of power plant safety procedures',
      type: 'quiz',
      difficulty: 'easy',
      points: 100,
      completed: true,
      icon: <CheckCircle className="w-6 h-6 text-green-500" />
    },
    {
      id: 'diagnostic-challenge',
      title: 'Diagnostic Challenge',
      description: 'Identify the root cause of engine failures',
      type: 'simulation',
      difficulty: 'hard',
      points: 300,
      completed: false,
      icon: <Target className="w-6 h-6 text-blue-500" />
    },
    {
      id: 'maintenance-sequence',
      title: 'Maintenance Sequence',
      description: 'Arrange maintenance steps in correct order',
      type: 'drag-drop',
      difficulty: 'medium',
      points: 200,
      completed: false,
      icon: <RefreshCw className="w-6 h-6 text-purple-500" />
    },
    {
      id: 'emergency-response',
      title: 'Emergency Response',
      description: 'Handle emergency situations effectively',
      type: 'simulation',
      difficulty: 'hard',
      points: 400,
      completed: false,
      icon: <Zap className="w-6 h-6 text-red-500" />
    }
  ]

  const leaderboard = [
    { rank: 1, name: 'John Smith', points: 2850, level: 8 },
    { rank: 2, name: 'Sarah Johnson', points: 2640, level: 7 },
    { rank: 3, name: 'Mike Wilson', points: 2450, level: 7 },
    { rank: 4, name: 'You', points: userProgress.totalPoints, level: userProgress.level },
    { rank: 5, name: 'Lisa Brown', points: 1980, level: 6 },
  ]

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isQuizActive && timeRemaining > 0) {
      timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1)
      }, 1000)
    } else if (timeRemaining === 0) {
      handleTimeUp()
    }
    return () => clearTimeout(timer)
  }, [isQuizActive, timeRemaining])

  const startQuiz = () => {
    setCurrentView('quiz')
    setCurrentQuiz(sampleQuestions[0])
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setQuizScore(0)
    setTimeRemaining(30)
    setIsQuizActive(true)
  }

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return

    const isCorrect = selectedAnswer === currentQuiz?.correct
    if (isCorrect) {
      setQuizScore(prev => prev + 1)
    }

    setShowResult(true)
    setIsQuizActive(false)

    setTimeout(() => {
      if (currentQuestionIndex < sampleQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1)
        setCurrentQuiz(sampleQuestions[currentQuestionIndex + 1])
        setSelectedAnswer(null)
        setShowResult(false)
        setTimeRemaining(30)
        setIsQuizActive(true)
      } else {
        // Quiz completed
        const finalScore = isCorrect ? quizScore + 1 : quizScore
        const points = finalScore * 50
        setUserProgress(prev => ({
          ...prev,
          totalPoints: prev.totalPoints + points,
          completedChallenges: prev.completedChallenges + 1
        }))
        toast.success(`Quiz completed! You scored ${finalScore}/${sampleQuestions.length} and earned ${points} points!`)
        setCurrentView('overview')
      }
    }, 2000)
  }

  const handleTimeUp = () => {
    setIsQuizActive(false)
    setShowResult(true)
    setSelectedAnswer(-1) // Indicates time up
    setTimeout(() => {
      if (currentQuestionIndex < sampleQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1)
        setCurrentQuiz(sampleQuestions[currentQuestionIndex + 1])
        setSelectedAnswer(null)
        setShowResult(false)
        setTimeRemaining(30)
        setIsQuizActive(true)
      } else {
        toast.error('Quiz completed! Time ran out.')
        setCurrentView('overview')
      }
    }, 2000)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-500'
      case 'medium': return 'text-yellow-500'
      case 'hard': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getLevelProgress = () => {
    const pointsForCurrentLevel = userProgress.totalPoints % 500
    const progressPercentage = (pointsForCurrentLevel / 500) * 100
    return progressPercentage
  }

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Progress Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <Trophy className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Level {userProgress.level}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{userProgress.totalPoints} points</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-yellow-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${getLevelProgress()}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {500 - (userProgress.totalPoints % 500)} points to next level
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Target className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Challenges</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{userProgress.completedChallenges} completed</p>
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {userProgress.completedChallenges}/{challenges.length}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <TrendingUp className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Streak</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{userProgress.streak} days</p>
            </div>
          </div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            🔥 {userProgress.streak}
          </div>
        </motion.div>
      </div>

      {/* Quick Start Section */}
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Quick Start</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.button
            onClick={startQuiz}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition-all"
          >
            <div className="flex items-center space-x-3">
              <Play className="w-6 h-6" />
              <div className="text-left">
                <div className="font-semibold">Start Quiz</div>
                <div className="text-sm opacity-90">Test your knowledge</div>
              </div>
            </div>
          </motion.button>

          <motion.button
            onClick={() => setCurrentView('leaderboard')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow-md hover:from-purple-600 hover:to-purple-700 transition-all"
          >
            <div className="flex items-center space-x-3">
              <Users className="w-6 h-6" />
              <div className="text-left">
                <div className="font-semibold">Leaderboard</div>
                <div className="text-sm opacity-90">See rankings</div>
              </div>
            </div>
          </motion.button>
        </div>
      </div>

      {/* Challenges Section */}
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Challenges</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {challenges.map((challenge, index) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border-2 transition-all ${
                challenge.completed
                  ? 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800'
                  : 'border-gray-200 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 hover:border-primary'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {challenge.icon}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{challenge.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{challenge.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-primary">{challenge.points}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">points</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                  {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                </span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    challenge.completed
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90'
                  }`}
                  disabled={challenge.completed}
                >
                  {challenge.completed ? 'Completed' : 'Start'}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Achievements Section */}
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {userProgress.achievements.map((achievement, index) => (
            <motion.div
              key={achievement}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
            >
              <Award className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              <span className="font-medium text-yellow-800 dark:text-yellow-200">{achievement}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderQuiz = () => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
        {/* Quiz Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Question {currentQuestionIndex + 1} of {sampleQuestions.length}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Score: {quizScore}/{sampleQuestions.length}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{timeRemaining}s</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Time remaining</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-8">
          <motion.div
            className="bg-primary h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestionIndex + 1) / sampleQuestions.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Question */}
        {currentQuiz && (
          <div>
            <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
              {currentQuiz.question}
            </h3>

            {/* Options */}
            <div className="space-y-4 mb-8">
              {currentQuiz.options.map((option, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showResult}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    showResult
                      ? index === currentQuiz.correct
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                        : selectedAnswer === index
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                        : 'border-gray-200 bg-gray-50 dark:bg-gray-700 dark:border-gray-600'
                      : selectedAnswer === index
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-200 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 hover:border-primary'
                  }`}
                  whileHover={{ scale: showResult ? 1 : 1.02 }}
                  whileTap={{ scale: showResult ? 1 : 0.98 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      showResult
                        ? index === currentQuiz.correct
                          ? 'border-green-500 bg-green-500'
                          : selectedAnswer === index
                          ? 'border-red-500 bg-red-500'
                          : 'border-gray-300'
                        : selectedAnswer === index
                        ? 'border-primary bg-primary'
                        : 'border-gray-300'
                    }`}>
                      {showResult && index === currentQuiz.correct && (
                        <CheckCircle className="w-4 h-4 text-white" />
                      )}
                      {showResult && selectedAnswer === index && index !== currentQuiz.correct && (
                        <XCircle className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span className="font-medium">{option}</span>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Explanation */}
            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 mb-6"
              >
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Explanation:</h4>
                <p className="text-blue-700 dark:text-blue-300">{currentQuiz.explanation}</p>
              </motion.div>
            )}

            {/* Submit Button */}
            {!showResult && (
              <motion.button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null}
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Submit Answer
              </motion.button>
            )}
          </div>
        )}
      </div>
    </div>
  )

  const renderLeaderboard = () => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Leaderboard</h2>
        <div className="space-y-4">
          {leaderboard.map((user, index) => (
            <motion.div
              key={user.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center space-x-4 p-4 rounded-lg ${
                user.name === 'You'
                  ? 'bg-primary/10 border-2 border-primary'
                  : 'bg-gray-50 dark:bg-gray-700'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                user.rank === 1
                  ? 'bg-yellow-500 text-white'
                  : user.rank === 2
                  ? 'bg-gray-400 text-white'
                  : user.rank === 3
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}>
                {user.rank}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 dark:text-white">{user.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Level {user.level}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-primary">{user.points}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">points</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )

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
                onClick={() => currentView === 'overview' ? navigate('/dashboard') : setCurrentView('overview')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </motion.button>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Learning Center
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Interactive training and skill development
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  Level {userProgress.level}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {userProgress.totalPoints} points
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentView === 'overview' && renderOverview()}
            {currentView === 'quiz' && renderQuiz()}
            {currentView === 'leaderboard' && renderLeaderboard()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default GamificationPage