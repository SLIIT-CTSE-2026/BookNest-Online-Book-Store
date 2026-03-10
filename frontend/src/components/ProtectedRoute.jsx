import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');
  
  if (!token || !userData) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    const user = JSON.parse(userData);
    const allowedRoles = requiredRole.split(',');
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
}
