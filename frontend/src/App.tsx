import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './hooks/useAuth'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import ChatPage from './pages/ChatPage'
import TroubleshootingPage from './pages/TroubleshootingPage'
import GamificationPage from './pages/GamificationPage'
import AdminPage from './pages/AdminPage'
import LoadingSpinner from './components/LoadingSpinner'

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
      />
      <Route
        path="/dashboard"
        element={user ? <Dashboard /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/chat"
        element={user ? <ChatPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/troubleshooting"
        element={user ? <TroubleshootingPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/gamification"
        element={user ? <GamificationPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/admin"
        element={
          user && user.role === 'admin' ? (
            <AdminPage />
          ) : (
            <Navigate to="/dashboard" replace />
          )
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-background text-foreground">
          <AppRoutes />
        </div>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App