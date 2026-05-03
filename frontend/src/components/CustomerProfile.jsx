import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { customerAPI } from '../utils/api'; 

export default function CustomerProfile() {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({ orderCount: 0, feedbackCount: 0 });
  
  const navigate = useNavigate();
  const { customerId } = useParams();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    
    if (parsedUser.role !== 'customer' || parsedUser.userId !== customerId) {
      navigate('/customer-dashboard');
      return;
    }

    const fetchAllData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [profileRes, summaryRes] = await Promise.all([
          customerAPI.getCustomerById(customerId),
          customerAPI.getSummary(customerId)
        ]);

        if (profileRes.data.success) {
          setCustomer(profileRes.data.data.customer);
        }

        if (summaryRes.data.success) {
          setSummary(summaryRes.data.data);
        }

      } catch (err) {
        console.error('Data fetch error:', err);
        setError(err.response?.data?.message || 'Failed to connect to the API Gateway at port 5000.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [navigate, customerId]);

  const handleBack = () => {
    navigate('/customer-dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar section */}
      <nav className="bg-white shadow-sm px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Book<span className="text-indigo-600">Nest</span>
        </h1>
        <button onClick={handleBack} className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm">
          Back to Dashboard
        </button>
      </nav>

      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">👤</div>
          <h2 className="text-3xl font-bold text-gray-900">Customer Profile</h2>
          <p className="text-gray-600">Verified activity across services</p>
        </div>

        {/* Activity Summary Section (Shows inter-service data) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-indigo-600 p-6 rounded-xl text-white shadow-lg">
            <span className="text-indigo-100 text-xs font-bold uppercase">Total Orders</span>
            <div className="text-4xl font-extrabold mt-2">{summary.orderCount}</div>
          </div>
          <div className="bg-emerald-600 p-6 rounded-xl text-white shadow-lg">
            <span className="text-emerald-100 text-xs font-bold uppercase">Feedbacks Submitted</span>
            <div className="text-4xl font-extrabold mt-2">{summary.feedbackCount}</div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="bg-white shadow rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 border-b pb-4 mb-6">Account Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section>
              <label className="text-xs font-bold text-gray-400 uppercase">Full Name</label>
              <p className="text-gray-900 font-medium mb-4">{customer?.name}</p>
              
              <label className="text-xs font-bold text-gray-400 uppercase">Email</label>
              <p className="text-gray-900 font-medium">{customer?.email}</p>
            </section>
            <section>
              <label className="text-xs font-bold text-gray-400 uppercase">Member Since</label>
              <p className="text-gray-900 font-medium mb-4">
                {new Date(customer?.createDate).toLocaleDateString()}
              </p>
              
              <label className="text-xs font-bold text-gray-400 uppercase">Account Status</label>
              <p className="text-emerald-600 font-bold uppercase text-sm">Active</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}