import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import CustomerDashboard from './components/CustomerDashboard';
import CustomerProfile from './components/CustomerProfile';
import SellerDashboard from './components/SellerDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import SellerProfile from './components/SellerProfile';

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
          path="/customer-profile/:customerId" 
          element={
            <ProtectedRoute requiredRole="customer">
              <CustomerProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/seller-profile/:sellerId" 
          element={
            <ProtectedRoute requiredRole="seller">
              <SellerProfile />
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
      </Routes>
    </Router>
  )
}