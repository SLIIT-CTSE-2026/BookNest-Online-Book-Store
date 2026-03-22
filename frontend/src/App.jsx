import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import CustomerDashboard from './components/CustomerDashboard';
import SellerDashboard from './components/SellerDashboard';
import FeedbackPage from './components/FeedbackPage';
import SellerFeedbackPage from './components/SellerFeedbackPage';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route 
          path="/customer-dashboard" 
          element={
            <ProtectedRoute requiredRole="customer">
              <CustomerDashboard />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/customer-feedback"
          element={
            <ProtectedRoute requiredRole="customer">
              <FeedbackPage />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/seller-dashboard" 
          element={
            <ProtectedRoute requiredRole="seller">
              <SellerDashboard />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/seller-feedback"
          element={
            <ProtectedRoute requiredRole="seller">
              <SellerFeedbackPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}