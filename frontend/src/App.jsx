import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import CustomerDashboard from './components/CustomerDashboard';
import AddBookPage from './components/AddBookPage';
import FeedbackPage from './components/FeedbackPage';
import SellerFeedbackPage from './components/SellerFeedbackPage';
import ProtectedRoute from './components/ProtectedRoute';
import OrderList from './components/OrderList';
import OrderDetails from './components/OrderDetails';
import CreateOrder from './components/CreateOrder';
import CustomerProfile from './components/CustomerProfile';
import SellerDashboard from './components/SellerDashboard';
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
          path="/seller/add-book" 
          element={
            <ProtectedRoute requiredRole="seller">
              <AddBookPage />
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
          path="/orders" 
          element={
            <ProtectedRoute>
              <OrderList />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/order-details/:orderId" 
          element={
            <ProtectedRoute>
              <OrderDetails />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/create-order" 
          element={
            <ProtectedRoute>
              <CreateOrder />
            </ProtectedRoute>
          } 
        />

      </Routes>
    </Router>
  )
}