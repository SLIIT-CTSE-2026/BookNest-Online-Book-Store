import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { feedbackAPI } from '../utils/api';

export default function SellerFeedbackPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchOrderId, setSearchOrderId] = useState('');
  const [searchProductId, setSearchProductId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const rawUser = localStorage.getItem('user');

    if (!token || !rawUser) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(rawUser);
    if (parsedUser.role !== 'seller') {
      navigate('/login');
      return;
    }

    setUser(parsedUser);
    loadFeedback();
  }, [navigate]);

  const ratingSummary = useMemo(() => {
    if (!items.length) return 'No customer ratings yet';
    const total = items.reduce((sum, item) => sum + Number(item.rating || 0), 0);
    return `Average customer rating: ${(total / items.length).toFixed(1)} / 5`;
  }, [items]);

  const loadFeedback = async (orderId = '', productId = '') => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (orderId) params.orderId = orderId;
      if (productId) params.productId = productId;
      const response = await feedbackAPI.listForSeller(params);
      setItems(response.data?.data?.feedback || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch seller feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    await loadFeedback(searchOrderId.trim(), searchProductId.trim());
  };

  const handleReset = async () => {
    setSearchOrderId('');
    setSearchProductId('');
    await loadFeedback('', '');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-white to-orange-100">
      <nav className="bg-white/85 backdrop-blur border-b border-amber-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <Link to="/" className="text-2xl font-bold text-slate-800">
              Book<span className="text-orange-700">Nest</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link
                to="/seller-dashboard"
                className="text-sm font-semibold text-slate-600 hover:text-slate-900"
              >
                Dashboard
              </Link>
              <span className="text-sm text-slate-600">{user.name}</span>
              <button
                onClick={handleLogout}
                className="bg-slate-800 hover:bg-black text-white text-sm px-4 py-2 rounded-lg transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="mb-6 bg-white rounded-2xl border border-amber-200 shadow-sm p-6">
          <h1 className="text-3xl font-bold text-slate-900">Customer Feedback</h1>
          <p className="text-slate-600 mt-2">Review what customers said about each of your sold products.</p>
          <p className="text-sm text-orange-700 font-semibold mt-2">{ratingSummary}</p>
        </section>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <section className="bg-white rounded-2xl border border-amber-200 shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <h2 className="text-xl font-bold text-slate-900">Feedback Feed</h2>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchOrderId}
                onChange={(e) => setSearchOrderId(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                placeholder="Filter by Order ID"
              />
              <input
                type="text"
                value={searchProductId}
                onChange={(e) => setSearchProductId(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                placeholder="Filter by Product ID"
              />
              <button
                type="submit"
                className="bg-slate-800 hover:bg-black text-white px-3 py-2 rounded-lg text-sm font-semibold"
              >
                Search
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-sm font-semibold"
              >
                Reset
              </button>
            </form>
          </div>

          {loading ? (
            <div className="text-slate-600">Loading feedback...</div>
          ) : items.length === 0 ? (
            <div className="text-slate-600 border border-dashed border-slate-300 rounded-xl p-6 text-center">
              No feedback found for your seller account yet.
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <article key={item._id} className="border border-slate-200 rounded-xl p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-500">Order</p>
                      <p className="font-semibold text-slate-900">{item.orderId}</p>
                      <p className="text-sm text-slate-500 mt-1">Product</p>
                      <p className="font-semibold text-slate-900">{item.productName || item.productId}</p>
                      <p className="text-xs text-slate-500">{item.productId}</p>
                    </div>
                    <div className="text-sm text-slate-500">
                      {new Date(item.updatedAt || item.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-slate-600">Rating: {item.rating}/5</p>
                  <p className="mt-2 text-slate-800">{item.comment || 'No comment provided.'}</p>

                  <div className="mt-3 text-xs text-slate-500">
                    Customer ID: {item.customerId}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}