import { Navigate } from 'react-router-dom';
import { getToken } from '../api/auth';

/**
 * @param {string} requiredRole - e.g. 'ROLE_SUPER_ADMIN' or 'ROLE_USER'
 * @param {string} redirectTo   - where to send unauthenticated users
 */
export default function ProtectedRoute({ children, requiredRole, redirectTo = '/login' }) {
  const token = getToken();

  if (!token) {
    return <Navigate to={redirectTo} replace />;
  }

  // Decode JWT payload (base64) to check roles without an extra API call
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const roles = payload.roles || [];

    if (requiredRole && !roles.includes(requiredRole)) {
      return <Navigate to={redirectTo} replace />;
    }
  } catch {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
