import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import AdminLoginPage from './pages/AdminLoginPage'
import UserDashboard from './pages/UserDashboard'
import AdminDashboard from './pages/AdminDashboard'
import UserManagementPage from './pages/UserManagementPage'
import UserFormPage from './pages/UserFormPage'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requiredRole="ROLE_USER" redirectTo="/login">
            <UserDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute requiredRole="ROLE_SUPER_ADMIN" redirectTo="/admin/login">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users"
        element={
          <ProtectedRoute requiredRole="ROLE_SUPER_ADMIN" redirectTo="/admin/login">
            <UserManagementPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users/new"
        element={
          <ProtectedRoute requiredRole="ROLE_SUPER_ADMIN" redirectTo="/admin/login">
            <UserFormPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users/:id/edit"
        element={
          <ProtectedRoute requiredRole="ROLE_SUPER_ADMIN" redirectTo="/admin/login">
            <UserFormPage />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
