"use client"

import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./contexts/AuthContext"
import { DashboardLayout } from "./components/layout/DashboardLayout"
import { LoadingSpinner } from "./components/ui/loading-spinner"

// Public Pages
import LandingPage from "./pages/LandingPage"
import LoginPage from "./pages/auth/LoginPage"
import RegisterPage from "./pages/auth/RegisterPage"
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage"
import ResetPasswordPage from "./pages/auth/ResetPasswordPage"
import VerifyEmailPage from "./pages/auth/VerifyEmailPage"
import ChangePasswordPage from "./pages/auth/ChangePasswordPage"

// Authenticated User Pages
import DashboardPage from "./pages/DashboardPage"
import InterviewSetupPage from "./pages/interview/InterviewSetupPage"
import LiveInterviewPage from "./pages/interview/LiveInterviewPage"
import ReportsPage from "./pages/ReportsPage"
import ReportDetailPage from "./pages/ReportDetailPage"
import AnalyticsPage from "./pages/AnalyticsPage"
import ProfilePage from "./pages/ProfilePage"
import SubscriptionPage from "./pages/SubscriptionPage"
import SettingsPage from "./pages/SettingsPage"

// Admin Pages
import AdminDashboardPage from "./pages/admin/DashboardPage"
import AdminUsersPage from "./pages/admin/UsersPage"
import AdminPaymentsPage from "./pages/admin/PaymentsPage"
import AdminTemplatesPage from "./pages/admin/TemplatesPage"

function PrivateRoute({ children, roles }) {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="xl" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace /> // Redirect unauthorized roles
  }

  return <DashboardLayout>{children}</DashboardLayout>
}

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
      <Route path="/change-password" element={<ChangePasswordPage />} />

      {/* Authenticated User Routes */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute roles={["user", "admin"]}>
            <DashboardPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/interview/setup"
        element={
          <PrivateRoute roles={["user", "admin"]}>
            <InterviewSetupPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/interview/live/:interviewId"
        element={
          <PrivateRoute roles={["user", "admin"]}>
            <LiveInterviewPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <PrivateRoute roles={["user", "admin"]}>
            <ReportsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/reports/:reportId"
        element={
          <PrivateRoute roles={["user", "admin"]}>
            <ReportDetailPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <PrivateRoute roles={["user", "admin"]}>
            <AnalyticsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute roles={["user", "admin"]}>
            <ProfilePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/subscription"
        element={
          <PrivateRoute roles={["user", "admin"]}>
            <SubscriptionPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <PrivateRoute roles={["user", "admin"]}>
            <SettingsPage />
          </PrivateRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <PrivateRoute roles={["admin"]}>
            <AdminDashboardPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <PrivateRoute roles={["admin"]}>
            <AdminUsersPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/payments"
        element={
          <PrivateRoute roles={["admin"]}>
            <AdminPaymentsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/templates"
        element={
          <PrivateRoute roles={["admin"]}>
            <AdminTemplatesPage />
          </PrivateRoute>
        }
      />

      {/* Catch-all for undefined routes */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
